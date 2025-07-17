const Internship = require('../models/Internship');
const path = require('path');

// 🔹 Créer une offre
exports.createInternship = async (req, res) => {
  try {
    const { translations } = req.body;

    if (
      !translations?.fr?.title ||
      !translations?.fr?.description ||
      !translations?.en?.title ||
      !translations?.en?.description
    ) {
      return res.status(400).json({
        message: "Les traductions en français et en anglais sont obligatoires (titre et description)."
      });
    }

    let imagePath;
    if (req.file) {
      imagePath = `/uploads/internships/${req.file.filename}`;
    }

    const internship = new Internship({
      ...req.body,
      image: imagePath || null,
      createdBy: req.user._id
    });

    await internship.save();
    res.status(201).json(internship);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la création.' });
  }
};

// 🔹 Lire toutes les offres (admin)
exports.getAllInternships = async (req, res) => {
  try {
    const internships = await Internship.find().sort({ createdAt: -1 });
    res.status(200).json(internships);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// 🔹 Obtenir un seul stage par ID
exports.getInternshipById = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({ message: "Stage non trouvé." });
    }

    res.status(200).json(internship);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};


exports.updateInternship = async (req, res) => {
  try {
    const { translations } = req.body;

    if (
      !translations?.fr?.title ||
      !translations?.fr?.description ||
      !translations?.en?.title ||
      !translations?.en?.description
    ) {
      return res.status(400).json({
        message: "Les traductions en français et en anglais sont obligatoires (titre et description)."
      });
    }

    let updateData = { ...req.body };

    if (req.file) {
      updateData.image = `/uploads/internships/${req.file.filename}`;
    }

    const internship = await Internship.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!internship) {
      return res.status(404).json({ message: 'Offre non trouvée.' });
    }

    res.status(200).json(internship);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// 🔹 Supprimer une offre
exports.deleteInternship = async (req, res) => {
  try {
    const deleted = await Internship.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Offre non trouvée.' });
    res.status(200).json({ message: 'Offre supprimée avec succès.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.getPublicInternships = async (req, res) => {
  try {
    const { country, field, type, keyword, lang = 'fr', page = 1, limit = 10 } = req.query;

    const filters = { isActive: true };
    if (country) filters.country = country;
    if (field) filters.field = field;
    if (type) filters.type = type;

    if (keyword) {
      filters[`translations.${lang}.title`] = { $regex: keyword, $options: 'i' };
    }

    const total = await Internship.countDocuments(filters);
    const internships = await Internship.find(filters)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const data = internships.map(internship => ({
      id: internship._id,
      title: internship.translations[lang]?.title,
      description: internship.translations[lang]?.description,
      location: internship.translations[lang]?.location,
      field: internship.field,
      country: internship.country,
      type: internship.type,
      duration: internship.duration,
      salary: internship.salary,
      startDate: internship.startDate,
      endDate: internship.endDate,
      image: internship.image
    }));

    res.status(200).json({
      internships: data,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

