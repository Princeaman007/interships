const Application = require('../models/Application');
const sendEmail = require('../utils/mailer');
const Internship = require('../models/Internship');

exports.applyToInternship = async (req, res) => {
  try {
    const { internship: internshipId, message } = req.body;

    // Vérifie si déjà candidat
    const exists = await Application.findOne({
      internship: internshipId,
      applicant: req.user._id
    });

    if (exists) {
      return res.status(400).json({ message: "Vous avez déjà postulé à cette offre." });
    }

    const application = new Application({
      internship: internshipId,
      applicant: req.user._id,
      message,
      status: 'pending' // Statut par défaut
    });

    await application.save();

    // Récupérer les infos du stage
    const internshipDoc = await Internship.findById(internshipId);
    const user = req.user;

    const lang = req.headers['accept-language']?.startsWith('en') ? 'en' : 'fr';
    const internshipTitle = internshipDoc?.translations?.[lang]?.title || '[Stage]';

    const html = `
      <h3>Bonjour ${user.firstName},</h3>
      <p>Votre candidature au stage <strong>"${internshipTitle}"</strong> a bien été enregistrée.</p>
      <p>Date de soumission : ${new Date().toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US')}</p>
      <p>Nous vous contacterons si votre profil est retenu.</p>
      <p>Merci de faire confiance à notre plateforme.</p>
    `;

    await sendEmail(user.email, 'Confirmation de candidature', html);
    res.status(201).json({ 
      message: "Candidature envoyée avec succès.",
      application: {
        id: application._id,
        status: application.status,
        submittedAt: application.createdAt
      }
    });

  } catch (err) {
    console.error('Erreur applyToInternship:', err);
    res.status(500).json({ message: "Erreur lors de la candidature." });
  }
};

// ✅ SUPPRESSION DE LA FONCTION DUPLIQUÉE - Une seule version de getAllApplications
exports.getAllApplications = async (req, res) => {
  const lang = req.headers['accept-language']?.startsWith('en') ? 'en' : 'fr';
  const { status, internshipId, search } = req.query;

  try {
    const filters = {};

    if (status && ['pending', 'accepted', 'rejected'].includes(status)) {
      filters.status = status;
    }

    if (internshipId) {
      filters.internship = internshipId;
    }

    // Chercher par nom ou email (via .populate)
    const applications = await Application.find(filters)
      .populate({
        path: 'internship',
        select: 'translations field country type startDate endDate'
      })
      .populate({
        path: 'applicant',
        select: 'firstName lastName email profile.country'
      })
      .sort({ createdAt: -1 });

    // 🔍 Si recherche par nom ou email
    const filtered = search
      ? applications.filter(app =>
          `${app.applicant.firstName} ${app.applicant.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
          app.applicant.email.toLowerCase().includes(search.toLowerCase())
        )
      : applications;

    const data = filtered.map(app => ({
      id: app._id,
      status: app.status || 'pending',
      submittedAt: app.createdAt,
      message: app.message,
      applicant: {
        id: app.applicant._id,
        firstName: app.applicant.firstName,
        lastName: app.applicant.lastName,
        email: app.applicant.email,
        country: app.applicant.profile?.country
      },
      internship: {
        id: app.internship._id,
        title: app.internship.translations?.[lang]?.title || 'Titre non disponible',
        field: app.internship.field,
        country: app.internship.country,
        type: app.internship.type,
        startDate: app.internship.startDate,
        endDate: app.internship.endDate
      }
    }));

    res.status(200).json({
      success: true,
      count: data.length,
      data: data
    });
  } catch (err) {
    console.error('Erreur getAllApplications:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.getApplicationById = async (req, res) => {
  const lang = req.headers['accept-language']?.startsWith('en') ? 'en' : 'fr';

  try {
    const application = await Application.findById(req.params.id)
      .populate({
        path: 'internship',
        select: 'translations field country type startDate endDate'
      })
      .populate({
        path: 'applicant',
        select: 'firstName lastName email profile.country role'
      });

    if (!application) {
      return res.status(404).json({ message: 'Candidature non trouvée.' });
    }

    // 🔒 Si étudiant : il ne peut voir que sa propre candidature
    if (req.user.role === 'étudiant' && application.applicant._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    res.status(200).json({
      success: true,
      data: {
        id: application._id,
        status: application.status || 'pending',
        submittedAt: application.createdAt,
        message: application.message,
        applicant: {
          id: application.applicant._id,
          firstName: application.applicant.firstName,
          lastName: application.applicant.lastName,
          email: application.applicant.email,
          country: application.applicant.profile?.country
        },
        internship: {
          id: application.internship._id,
          title: application.internship.translations?.[lang]?.title || 'Titre non disponible',
          field: application.internship.field,
          country: application.internship.country,
          type: application.internship.type,
          startDate: application.internship.startDate,
          endDate: application.internship.endDate
        }
      }
    });
  } catch (err) {
    console.error('Erreur getApplicationById:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  const { status } = req.body;

  if (!['pending', 'accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Statut invalide.' });
  }

  try {
    const application = await Application.findById(req.params.id)
      .populate('applicant')
      .populate('internship');

    if (!application) {
      return res.status(404).json({ message: 'Candidature non trouvée.' });
    }

    application.status = status;
    await application.save();

    // ✉️ Email automatique (sauf si juste repassé en "pending")
    if (status === 'accepted' || status === 'rejected') {
      const lang = req.headers['accept-language']?.startsWith('en') ? 'en' : 'fr';
      const internshipTitle = application.internship.translations?.[lang]?.title || '[Stage]';
      const user = application.applicant;

      const subject = status === 'accepted'
        ? (lang === 'fr' ? 'Votre candidature a été acceptée' : 'Your application has been accepted')
        : (lang === 'fr' ? 'Votre candidature a été refusée' : 'Your application has been rejected');

      const message =
        status === 'accepted'
          ? (lang === 'fr'
              ? `<p>Bonjour ${user.firstName},</p><p>Félicitations ! Votre candidature au stage <strong>${internshipTitle}</strong> a été acceptée.</p><p>Nous vous recontacterons très bientôt.</p>`
              : `<p>Hello ${user.firstName},</p><p>Congratulations! Your application for the internship <strong>${internshipTitle}</strong> has been accepted.</p><p>We will contact you soon.</p>`)
          : (lang === 'fr'
              ? `<p>Bonjour ${user.firstName},</p><p>Nous sommes désolés de vous informer que votre candidature au stage <strong>${internshipTitle}</strong> a été refusée.</p><p>Merci pour votre intérêt.</p>`
              : `<p>Hello ${user.firstName},</p><p>We regret to inform you that your application for the internship <strong>${internshipTitle}</strong> has been rejected.</p><p>Thank you for applying.</p>`);

      try {
        await sendEmail(user.email, subject, message);
      } catch (emailError) {
        console.error('Erreur envoi email:', emailError);
        // Ne pas faire échouer la requête si l'email échoue
      }
    }

    res.status(200).json({ 
      message: `Statut mis à jour en "${status}".`,
      application: {
        id: application._id,
        status: application.status
      }
    });
  } catch (err) {
    console.error('Erreur updateApplicationStatus:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate({
        path: 'internship',
        select: 'translations location startDate field country type',
      })
      .sort({ createdAt: -1 });

    const lang = req.headers['accept-language']?.startsWith('en') ? 'en' : 'fr';

    const formatted = applications.map(app => ({
      id: app._id,
      status: app.status || 'pending',
      submittedAt: app.createdAt,
      message: app.message,
      internship: {
        id: app.internship?._id,
        title: app.internship?.translations?.[lang]?.title || 'Titre non disponible',
        location: app.internship?.location,
        field: app.internship?.field,
        country: app.internship?.country,
        type: app.internship?.type,
        startDate: app.internship?.startDate
      }
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (err) {
    console.error('Erreur getMyApplications:', err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ✅ NOUVELLE FONCTION pour la route /etudiant/:studentId
exports.getApplicationsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    console.log(`📋 Récupération des candidatures pour l'étudiant: ${studentId}`);
    console.log(`👤 Utilisateur connecté: ${req.user._id} (${req.user.role})`);
    
    // Vérification des permissions
    if (req.user.role !== 'admin' && req.user._id.toString() !== studentId) {
      console.log(`❌ Accès refusé: l'utilisateur ${req.user._id} tente d'accéder aux candidatures de ${studentId}`);
      return res.status(403).json({ 
        message: 'Accès non autorisé à ces candidatures',
        error: 'FORBIDDEN_ACCESS'
      });
    }
    
    const applications = await Application.find({ applicant: studentId })
      .populate({
        path: 'internship',
        select: 'translations location startDate field country type endDate description requirements',
      })
      .populate({
        path: 'applicant',
        select: 'firstName lastName email'
      })
      .sort({ createdAt: -1 });

    const lang = req.headers['accept-language']?.startsWith('en') ? 'en' : 'fr';

    const formatted = applications.map(app => ({
      id: app._id,
      status: app.status || 'pending',
      submittedAt: app.createdAt,
      updatedAt: app.updatedAt,
      message: app.message,
      applicant: {
        id: app.applicant._id,
        firstName: app.applicant.firstName,
        lastName: app.applicant.lastName,
        email: app.applicant.email
      },
      internship: {
        id: app.internship?._id,
        title: app.internship?.translations?.[lang]?.title || 'Titre non disponible',
        description: app.internship?.translations?.[lang]?.description || app.internship?.description,
        location: app.internship?.location,
        field: app.internship?.field,
        country: app.internship?.country,
        type: app.internship?.type,
        startDate: app.internship?.startDate,
        endDate: app.internship?.endDate,
        requirements: app.internship?.requirements
      }
    }));

    // Statistiques des candidatures
    const stats = {
      total: formatted.length,
      pending: formatted.filter(app => app.status === 'pending').length,
      accepted: formatted.filter(app => app.status === 'accepted').length,
      rejected: formatted.filter(app => app.status === 'rejected').length,
      withdrawn: formatted.filter(app => app.status === 'withdrawn').length
    };
    
    console.log(`✅ ${formatted.length} candidatures trouvées pour l'étudiant ${studentId}`);
    
    res.status(200).json({
      success: true,
      count: formatted.length,
      stats: stats,
      data: formatted,
      message: `${formatted.length} candidatures récupérées avec succès`
    });
    
  } catch (error) {
    console.error('❌ Erreur getApplicationsByStudent:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la récupération des candidatures',
      error: process.env.NODE_ENV !== 'production' ? error.message : 'Internal server error'
    });
  }
};

exports.deleteMyApplication = async (req, res) => {
  const applicationId = req.params.id;

  try {
    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({ message: 'Candidature introuvable.' });
    }

    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé à supprimer cette candidature.' });
    }

    await Application.findByIdAndDelete(applicationId);

    res.status(200).json({ 
      message: 'Candidature supprimée avec succès.',
      deletedId: applicationId
    });
  } catch (err) {
    console.error('Erreur deleteMyApplication:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.updateMyApplication = async (req, res) => {
  const applicationId = req.params.id;
  const { message } = req.body;

  try {
    const application = await Application.findById(applicationId).populate('internship');

    if (!application) {
      return res.status(404).json({ message: 'Candidature introuvable.' });
    }

    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé à modifier cette candidature.' });
    }

    // 🕒 Vérifie la limite de modification
    const internshipStart = new Date(application.internship.startDate);
    const limitDate = new Date(internshipStart);
    limitDate.setDate(limitDate.getDate() - 7); // 7 jours avant le début

    if (new Date() > limitDate) {
      return res.status(400).json({ message: 'Il est trop tard pour modifier cette candidature.' });
    }

    application.message = message;
    await application.save();

    res.status(200).json({ 
      message: 'Candidature mise à jour avec succès.',
      application: {
        id: application._id,
        message: application.message,
        updatedAt: application.updatedAt
      }
    });
  } catch (err) {
    console.error('Erreur updateMyApplication:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};