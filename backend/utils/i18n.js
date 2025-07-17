const fr = require('../locales/fr.json');
const en = require('../locales/en.json');

function t(key, lang = 'fr') {
  const dict = lang.startsWith('en') ? en : fr;

  return key.split('.').reduce((obj, part) => {
    if (obj && obj[part] !== undefined) return obj[part];
    return key; 
  }, dict);
}

module.exports = { t }; 
