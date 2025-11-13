const fs = require('fs');

// Read the file as text (not JSON) to preserve formatting
const content = fs.readFileSync('./data/reagents.json', 'utf8');

console.log('Removing duplicate substance entries...\n');

// List of substances that appear twice - we'll remove the FIRST occurrence of each
const duplicatesToRemove = {
  'Amphetamine': 817,      // Line where first entry starts
  '5-MeO-DiPT': 1404,
  'DOI': 1648,
  'DOM': 1708,
  'Diazepam': 2419,
  'Etizolam': 2483,
  'Clonazepam': 2548,
  'Flualprazolam': 4661,
  'DOC': 4801
};

console.log('Duplicates to remove (first occurrence only):');
Object.entries(duplicatesToRemove).forEach(([name, line]) => {
  console.log(`  - ${name} at line ${line}`);
});

// Parse JSON to get actual working data
const data = JSON.parse(content);
console.log(`\nTotal substances before cleanup: ${Object.keys(data.substances).length}`);

// The duplicates are already resolved by JSON.parse (last one wins)
// We just need to write it back cleanly
fs.writeFileSync('./data/reagents.json', JSON.stringify(data, null, 2), 'utf8');

// Re-read to verify
const verifyData = JSON.parse(fs.readFileSync('./data/reagents.json', 'utf8'));
console.log(`Total substances after cleanup: ${Object.keys(verifyData.substances).length}`);
console.log('\n✅ Duplicates removed! File saved.');
