const fs = require('fs-extra');
const path = require('path');

console.log('🔨 Building for production...\n');

// Clean build directory
if (fs.existsSync('./build')) {
  console.log('🧹 Cleaning old build directory...');
  fs.removeSync('./build');
}

// Create build directory
console.log('📁 Creating build directory...');
fs.ensureDirSync('./build');

// Files and directories to copy
const itemsToCopy = [
  'index.html',
  'manifest.webmanifest',
  'robots.txt',
  'sitemap.xml',
  '.htaccess',
  'app.js',
  'data-loader.js',
  'news-aggregator.js',
  'legal-pages.js',
  'molecule-viewer.js',
  'reagent-calculator.js',
  'sw.js',
  'data',
  'icons',
  'assets'
];

// Copy each item
console.log('📦 Copying files to build directory...\n');
itemsToCopy.forEach(item => {
  const srcPath = path.join('.', item);
  const destPath = path.join('./build', item);
  
  if (fs.existsSync(srcPath)) {
    fs.copySync(srcPath, destPath);
    console.log(`  ✓ Copied ${item}`);
  } else {
    console.log(`  ⚠ Skipped ${item} (not found)`);
  }
});

console.log('\n✅ Files copied to build/ directory');

// Create 404.html for GitHub Pages SPA routing
console.log('📄 Creating 404.html for GitHub Pages...');
fs.copySync('./build/index.html', './build/404.html');
console.log('  ✓ Created 404.html');

console.log('\n📝 Ready for react-snap pre-rendering...\n');
