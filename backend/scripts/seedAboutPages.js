require('dotenv').config();
const mongoose = require('mongoose');
const AboutPage = require('../models/AboutPage');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const seed = async () => {
  try {
    await AboutPage.deleteMany(); // reset les pages About Us

    const pages = [
      {
        slug: 'why-hire',
        translations: {
          fr: {
            title: 'Pourquoi recruter un stagiaire ?',
            content: 'Accueillir un stagiaire, c’est investir dans l’avenir de votre entreprise tout en bénéficiant de compétences nouvelles.'
          },
          en: {
            title: 'Why hire an intern?',
            content: 'Hiring an intern is an investment in your company’s future and an opportunity to benefit from fresh talent.'
          }
        }
      },
      {
        slug: 'how-it-works',
        translations: {
          fr: {
            title: 'Comment ça fonctionne ?',
            content: 'Nous facilitons la mise en relation entre entreprises et étudiants internationaux via un processus simple et rapide.'
          },
          en: {
            title: 'How it works',
            content: 'We simplify the connection between companies and international students through a fast and clear process.'
          }
        }
      },
      {
        slug: 'submit-offer',
        translations: {
          fr: {
            title: 'Soumettre une offre',
            content: 'Vous avez une offre de stage ? Utilisez le formulaire ci-dessous pour la soumettre à notre équipe.'
          },
          en: {
            title: 'Submit an offer',
            content: 'Have an internship opportunity? Use the form below to submit it to our team.'
          }
        }
      }
    ];

    await AboutPage.insertMany(pages);
    console.log('✅ Pages About Us initialisées.');
    process.exit();
  } catch (err) {
    console.error('❌ Erreur lors de l’initialisation des pages About Us:', err);
    process.exit(1);
  }
};

seed();
