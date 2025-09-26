// Simple test to verify translation keys exist
const fs = require('fs');

// Read the language context file
const languageContext = fs.readFileSync('./contexts/language-context.tsx', 'utf8');

// Extract all translation keys from the TypeScript interface
const translationKeysMatch = languageContext.match(/"([^"]+)":\s*string;/g);
const translationKeys = translationKeysMatch ? translationKeysMatch.map(key => key.match(/"([^"]+)"/)[1]) : [];

console.log('Total translation keys found:', translationKeys.length);

// Check for the new keys we added
const newKeys = [
  'game.rules.gameOverview',
  'game.rules.gameSetup', 
  'game.rules.gameplayRules',
  'game.rules.specialCardRules',
  'game.rules.scoring',
  'game.health.modalTitle',
  'game.health.subtopic',
  'game.health.subtopics',
  'game.health.primary',
  'game.health.tags',
  'game.health.type',
  'game.health.card',
  'game.health.views',
  'game.health.subtopicDetails',
  'game.health.contentType',
  'game.health.difficulty',
  'game.health.cardAssociation',
  'game.health.totalViews',
  'game.health.items',
  'game.health.noContent',
  'game.health.close'
];

console.log('\nChecking for new translation keys:');
newKeys.forEach(key => {
  const exists = translationKeys.includes(key);
  console.log(`${exists ? '✓' : '✗'} ${key}`);
});

// Check if all languages have the same number of keys
const enMatch = languageContext.match(/en:\s*{([^}]+)}/);
const frMatch = languageContext.match(/fr:\s*{([^}]+)}/);
const rwMatch = languageContext.match(/rw:\s*{([^}]+)}/);

if (enMatch && frMatch && rwMatch) {
  const enKeys = (enMatch[1].match(/"([^"]+)":/g) || []).length;
  const frKeys = (frMatch[1].match(/"([^"]+)":/g) || []).length;
  const rwKeys = (rwMatch[1].match(/"([^"]+)":/g) || []).length;
  
  console.log(`\nTranslation key counts:`);
  console.log(`English: ${enKeys}`);
  console.log(`French: ${frKeys}`);
  console.log(`Kinyarwanda: ${rwKeys}`);
  console.log(`All languages have same count: ${enKeys === frKeys && frKeys === rwKeys ? '✓' : '✗'}`);
}
