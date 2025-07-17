const Faq = require('../models/Faq');

exports.createFaq = async (req, res) => {
  const { translations } = req.body;

  if (
    !translations?.fr?.question || !translations?.fr?.answer ||
    !translations?.en?.question || !translations?.en?.answer
  ) {
    return res.status(400).json({ message: 'Les deux langues sont requises.' });
  }

  try {
    const faq = new Faq({ translations });
    await faq.save();
    res.status(201).json({ message: 'FAQ créée avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.updateFaq = async (req, res) => {
  const { id } = req.params;
  const { translations } = req.body;

  if (
    !translations?.fr?.question || !translations?.fr?.answer ||
    !translations?.en?.question || !translations?.en?.answer
  ) {
    return res.status(400).json({ message: 'Les deux langues sont requises.' });
  }

  try {
    const faq = await Faq.findById(id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ introuvable.' });
    }

    faq.translations = translations;
    await faq.save();

    res.status(200).json({ message: 'FAQ mise à jour avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};


exports.getAllFaq = async (req, res) => {
  const lang = req.headers['accept-language']?.startsWith('en') ? 'en' : 'fr';

  try {
    const faqs = await Faq.find().sort({ createdAt: 1 }); // tri croissant

    const translatedFaqs = faqs.map(faq => ({
      id: faq._id,
      question: faq.translations[lang].question,
      answer: faq.translations[lang].answer
    }));

    res.status(200).json(translatedFaqs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.deleteFaq = async (req, res) => {
  try {
    const deleted = await Faq.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'FAQ introuvable.' });
    }
    res.status(200).json({ message: 'FAQ supprimée avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
