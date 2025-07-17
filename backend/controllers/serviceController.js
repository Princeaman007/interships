const ServicePage = require('../models/ServicePage');

// 🔓 GET /api/services/:slug — Public
exports.getServiceBySlug = async (req, res) => {
  const { slug } = req.params;
  const lang = req.headers['accept-language']?.startsWith('en') ? 'en' : 'fr';

  try {
    const service = await ServicePage.findOne({ slug });

    if (!service) {
      return res.status(404).json({ message: lang === 'fr' ? 'Service introuvable.' : 'Service not found.' });
    }

    res.status(200).json({
      slug: service.slug,
      icon: service.icon,
      pricingTable: service.pricingTable,
      ...service.translations[lang]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: lang === 'fr' ? 'Erreur serveur.' : 'Server error.' });
  }
};

// 🔒 PUT /api/services/:slug — Admin only
exports.updateServiceBySlug = async (req, res) => {
  const { slug } = req.params;
  const { translations, icon, pricingTable } = req.body;

  try {
    const service = await ServicePage.findOne({ slug });

    if (!service) {
      return res.status(404).json({ message: 'Service introuvable.' });
    }

    if (translations?.fr && translations?.en) {
      service.translations = translations;
    }

    if (icon) {
      service.icon = icon;
    }

    if (Array.isArray(pricingTable)) {
      service.pricingTable = pricingTable;
    }

    service.updatedAt = new Date();
    await service.save();

    res.status(200).json({ message: 'Service mis à jour avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
