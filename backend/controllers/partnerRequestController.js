const PartnerRequest = require('../models/PartnerRequest');

exports.createPartnerRequest = async (req, res) => {
  const { companyName, contactName, email, phone, message } = req.body;
  const lang = req.headers['accept-language']?.startsWith('en') ? 'en' : 'fr';

  if (!companyName || !contactName || !email) {
    return res.status(400).json({ message: lang === 'fr' ? 'Champs requis manquants.' : 'Missing required fields.' });
  }

  try {
    const newRequest = new PartnerRequest({
      companyName,
      contactName,
      email,
      phone,
      message
    });

    await newRequest.save();

    res.status(201).json({
      message: lang === 'fr'
        ? 'Votre demande a bien été envoyée. Nous vous contacterons rapidement.'
        : 'Your request has been submitted. We will contact you shortly.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: lang === 'fr' ? 'Erreur serveur.' : 'Server error.' });
  }
};

exports.getAllPartnerRequests = async (req, res) => {
  try {
    const requests = await PartnerRequest.find().sort({ submittedAt: -1 });
    res.status(200).json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.deletePartnerRequest = async (req, res) => {
  try {
    const request = await PartnerRequest.findByIdAndDelete(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Demande non trouvée.' });
    }

    res.status(200).json({ message: 'Demande supprimée avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

