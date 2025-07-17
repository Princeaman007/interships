const PartnerPageContent = require('../models/PartnerPageContent');

// 🔓 Route publique
exports.getPartnerPageContent = async (req, res) => {
  const lang = req.headers['accept-language']?.startsWith('en') ? 'en' : 'fr';

  try {
    const content = await PartnerPageContent.findOne();
    if (!content) {
      return res.status(404).json({ message: lang === 'fr' ? 'Contenu non disponible.' : 'Content not found.' });
    }

    res.status(200).json(content.translations[lang]);
  } catch (err) {
    res.status(500).json({ message: lang === 'fr' ? 'Erreur serveur.' : 'Server error.' });
  }
};

// 🔒 Route admin : mise à jour
exports.updatePartnerPageContent = async (req, res) => {
  const { translations } = req.body;

  if (
    !translations?.fr?.title || !translations?.fr?.content ||
    !translations?.en?.title || !translations?.en?.content
  ) {
    return res.status(400).json({ message: 'Les traductions FR et EN sont requises.' });
  }

  try {
    let content = await PartnerPageContent.findOne();

    if (content) {
      content.translations = translations;
      content.updatedAt = new Date();
    } else {
      content = new PartnerPageContent({ translations });
    }

    await content.save();
    res.status(200).json({ message: 'Contenu mis à jour avec succès.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
