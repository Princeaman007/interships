const Testimonial = require('../models/Testimonial');

exports.submitTestimonial = async (req, res) => {
  const { translations, authorName, role, country } = req.body;
  const user = req.user;

  try {
    const testimonial = new Testimonial({
      user: user._id,
      authorName,
      role,
      country,
      translations,
      avatarUrl: user.avatarUrl,
      approved: false
    });

    await testimonial.save();

    res.status(201).json({
      message: 'Témoignage soumis avec succès. Il sera affiché après validation.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.getApprovedTestimonials = async (req, res) => {
  const { lang, country } = req.query;

  const filter = { approved: true };
  if (lang) filter.lang = lang;
  if (country) filter.country = country;

  try {
    const testimonials = await Testimonial.find(filter).sort({ createdAt: -1 });
    res.status(200).json(testimonials);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.getTestimonialById = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial || !testimonial.approved) {
      return res.status(404).json({ message: 'Témoignage introuvable.' });
    }

    res.status(200).json(testimonial);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.getAllTestimonialsAdmin = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.status(200).json(testimonials);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.approveTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ message: 'Témoignage introuvable.' });
    }

    testimonial.approved = true;
    await testimonial.save();

    res.status(200).json({ message: 'Témoignage approuvé.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ message: 'Témoignage introuvable.' });
    }

    res.status(200).json({ message: 'Témoignage supprimé avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
