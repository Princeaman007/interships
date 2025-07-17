const OfferSubmission = require('../models/OfferSubmission');

exports.submitOffer = async (req, res) => {
  const lang = req.headers['accept-language']?.startsWith('en') ? 'en' : 'fr';
  const { companyName, contactName, email, phone, position, description } = req.body;

  if (!companyName || !contactName || !email || !position) {
    return res.status(400).json({
      message: lang === 'fr'
        ? 'Les champs obligatoires sont manquants.'
        : 'Missing required fields.'
    });
  }

  try {
    const newOffer = new OfferSubmission({
      companyName,
      contactName,
      email,
      phone,
      position,
      description
    });

    await newOffer.save();

    res.status(201).json({
      message: lang === 'fr'
        ? 'Votre offre a bien été envoyée.'
        : 'Your offer has been submitted.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: lang === 'fr' ? 'Erreur serveur.' : 'Server error.' });
  }
};

exports.getAllOffers = async (req, res) => {
  try {
    const offers = await OfferSubmission.find().sort({ submittedAt: -1 });
    res.status(200).json(offers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.deleteOffer = async (req, res) => {
  try {
    const offer = await OfferSubmission.findByIdAndDelete(req.params.id);

    if (!offer) {
      return res.status(404).json({ message: 'Offre non trouvée.' });
    }

    res.status(200).json({ message: 'Offre supprimée avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.getOfferById = async (req, res) => {
  try {
    const offer = await OfferSubmission.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ message: 'Offre non trouvée.' });
    }

    res.status(200).json(offer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

