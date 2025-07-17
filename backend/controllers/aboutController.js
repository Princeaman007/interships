const AboutPage = require('../models/AboutPage');

// 🔓 GET /api/about/:slug
exports.getAboutPage = async (req, res) => {
  const { slug } = req.params;
  const lang = req.headers['accept-language']?.startsWith('en') ? 'en' : 'fr';

  try {
    const page = await AboutPage.findOne({ slug });

    if (!page) {
      return res.status(404).json({ message: lang === 'fr' ? 'Page introuvable.' : 'Page not found.' });
    }

    res.status(200).json({
      slug: page.slug,
      ...page.translations[lang]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: lang === 'fr' ? 'Erreur serveur.' : 'Server error.' });
  }
};

// 🔒 PUT /api/about/:slug
exports.updateAboutPage = async (req, res) => {
  const { slug } = req.params;
  const { translations } = req.body;

  try {
    const page = await AboutPage.findOne({ slug });

    if (!page) {
      return res.status(404).json({ message: 'Page introuvable.' });
    }

    if (
      translations?.fr?.title &&
      translations?.fr?.content &&
      translations?.en?.title &&
      translations?.en?.content
    ) {
      page.translations = translations;
    } else {
      return res.status(400).json({ message: 'Les deux traductions complètes sont requises.' });
    }

    page.updatedAt = new Date();
    await page.save();

    res.status(200).json({ message: 'Page mise à jour avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
