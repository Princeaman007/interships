const ContactMessage = require('../models/ContactMessage');

exports.submitContactForm = async (req, res) => {
  const { fullName, email, subject, message, lang } = req.body;

  if (!fullName || !email || !subject || !message || !lang) {
    return res.status(400).json({
      message: lang === 'fr'
        ? 'Tous les champs sont requis.'
        : 'All fields are required.'
    });
  }

  try {
    const contact = new ContactMessage({
      fullName,
      email,
      subject,
      message,
      lang
    });

    await contact.save();

    res.status(201).json({
      message: lang === 'fr'
        ? 'Votre message a bien été envoyé. Nous vous répondrons bientôt.'
        : 'Your message has been sent. We will get back to you shortly.'
    });

    // ✉️ Optionnel plus tard : envoi email à l’admin ici

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: lang === 'fr' ? 'Erreur serveur.' : 'Server error.'
    });
  }
};

exports.getAllMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.getMessageById = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message introuvable.' });
    }

    res.status(200).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.replyToMessage = async (req, res) => {
  const { reply } = req.body;

  if (!reply) {
    return res.status(400).json({ message: 'La réponse ne peut pas être vide.' });
  }

  try {
    const message = await ContactMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message introuvable.' });
    }

    message.reply = reply;
    message.repliedBy = req.user._id;
    message.repliedAt = new Date();
    await message.save();

    // ✉️ Envoi de l’email ici plus tard

    res.status(200).json({ message: 'Réponse enregistrée avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const deleted = await ContactMessage.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Message introuvable.' });
    }

    res.status(200).json({ message: 'Message supprimé avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

