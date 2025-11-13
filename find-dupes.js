const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./data/reagents.json', 'utf8'));

console.log('Finding duplicate substances...\n');

const substances = data.substances;
const entries = Object.entries(substances);
const seen = new Map();
const duplicates = [];

entries.forEach(([key, value], index) => {
  if (seen.has(key)) {
    const firstIndex = seen.get(key);
    duplicates.push({
      name: key,
      first: { index: firstIndex, data: entries[firstIndex][1] },
      second: { index: index, data: value }
    });
  } else {
    seen.set(key, index);
  }
});

console.log(`Found ${duplicates.length} duplicates:\n`);

duplicates.forEach(dup => {
  console.log(`\n${dup.name}:`);
  console.log(`  First occurrence (position ${dup.first.index}):`);
  console.log(`    - Description fields: ${Object.keys(dup.first.data.description || {}).length}`);
  console.log(`    - Scientific papers: ${dup.first.data.description?.scientific_papers?.length || 0}`);
  console.log(`    - Testing entries: ${dup.first.data.testing?.length || 0}`);
  console.log(`    - Notes: ${dup.first.data.notes?.length || 0}`);
  
  console.log(`  Second occurrence (position ${dup.second.index}):`);
  console.log(`    - Description fields: ${Object.keys(dup.second.data.description || {}).length}`);
  console.log(`    - Scientific papers: ${dup.second.data.description?.scientific_papers?.length || 0}`);
  console.log(`    - Testing entries: ${dup.second.data.testing?.length || 0}`);
  console.log(`    - Notes: ${dup.second.data.notes?.length || 0}`);
  
  // Determine which is more complete
  const firstScore = 
    Object.keys(dup.first.data.description || {}).length +
    (dup.first.data.description?.scientific_papers?.length || 0) * 2 +
    (dup.first.data.testing?.length || 0);
  
  const secondScore = 
    Object.keys(dup.second.data.description || {}).length +
    (dup.second.data.description?.scientific_papers?.length || 0) * 2 +
    (dup.second.data.testing?.length || 0);
  
  console.log(`  → Keep: ${firstScore >= secondScore ? 'FIRST' : 'SECOND'} (score: ${Math.max(firstScore, secondScore)})`);
});
