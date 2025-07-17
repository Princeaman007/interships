require('dotenv').config();
const mongoose = require('mongoose');
const ServicePage = require('../models/ServicePage');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const seed = async () => {
  try {
    await ServicePage.deleteMany(); // 🔁 vide l'existant si besoin

    const services = [
      {
        slug: 'internship-search',
        icon: 'fa-briefcase',
        translations: {
          fr: {
            title: 'Recherche de stage',
            content: 'Nous vous accompagnons pour trouver un stage à l’international adapté à votre profil.'
          },
          en: {
            title: 'Internship Search',
            content: 'We help you find an international internship suited to your profile.'
          }
        }
      },
      {
        slug: 'housing',
        icon: 'fa-house-user',
        translations: {
          fr: {
            title: 'Logement',
            content: 'Nous vous aidons à trouver un logement abordable et sécurisé.'
          },
          en: {
            title: 'Housing',
            content: 'We assist you in finding affordable and safe accommodation.'
          }
        },
        pricingTable: [
          { type: 'Chambre partagée', ville: 'Paris', prix: '400€/mois' },
          { type: 'Studio privé', ville: 'Lyon', prix: '600€/mois' }
        ]
      },
      {
        slug: 'airport-pickup',
        icon: 'fa-plane-arrival',
        translations: {
          fr: {
            title: 'Accueil à l’aéroport',
            content: 'Nous vous accueillons à l’aéroport et vous conduisons à votre logement.'
          },
          en: {
            title: 'Airport Pickup',
            content: 'We pick you up at the airport and take you to your accommodation.'
          }
        },
        pricingTable: [
          { ville: 'Paris', service: 'Accueil simple', prix: '80€' },
          { ville: 'Marseille', service: 'Transport privé', prix: '120€' }
        ]
      },
      {
        slug: 'support',
        icon: 'fa-headset',
        translations: {
          fr: {
            title: 'Assistance',
            content: 'Une équipe dédiée pour vous accompagner durant toute votre expérience.'
          },
          en: {
            title: 'Support',
            content: 'A dedicated team to assist you throughout your experience.'
          }
        }
      }
    ];

    await ServicePage.insertMany(services);
    console.log('✅ Service pages inserted.');
    process.exit();
  } catch (err) {
    console.error('❌ Erreur insertion services :', err);
    process.exit(1);
  }
};

seed();
