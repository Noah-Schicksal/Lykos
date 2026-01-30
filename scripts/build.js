const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function rmdir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  let entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

// Main Build Process
console.log('Building project...');

// 1. Clean dist
console.log('Cleaning dist...');
rmdir(path.join(__dirname, '../dist'));

// 2. Compile Backend
console.log('Compiling API...');
try {
  execSync('npx tsc -p tsconfig.json', { stdio: 'inherit' });
} catch (e) {
  console.error('API Compilation failed');
  process.exit(1);
}

// 3. Compile Frontend
console.log('Compiling Frontend...');
try {
  execSync('npx tsc -p public/ts/tsconfig.json', { stdio: 'inherit' });
} catch (e) {
  console.error('Frontend Compilation failed');
  process.exit(1);
}

// 4. Copy Assets
console.log('Copying static assets...');

// Public root (index.html, etc)
const publicSrc = path.join(__dirname, '../public');
const publicDist = path.join(__dirname, '../dist/public');
const publicJsDist = path.join(publicDist, 'js');

if (!fs.existsSync(publicDist)) fs.mkdirSync(publicDist, { recursive: true });

// HTML files
// HTML files - Copy all .html files
const files = fs.readdirSync(publicSrc);
for (const file of files) {
  if (path.extname(file) === '.html') {
    fs.copyFileSync(
      path.join(publicSrc, file),
      path.join(publicDist, file)
    );
  }
}

// css folder
if (fs.existsSync(path.join(publicSrc, 'css'))) {
  copyDir(path.join(publicSrc, 'css'), path.join(publicDist, 'css'));
}

// Component CSS files (from public/ts/components/**/*.css -> dist/public/js/components/**/*.css)
function copyComponentStyles(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyComponentStyles(srcPath, destPath);
    } else if (entry.isFile() && entry.name.endsWith('.css')) {
      copyFile(srcPath, destPath);
    }
  }
}

copyComponentStyles(
  path.join(publicSrc, 'ts/components'),
  path.join(publicJsDist, 'components'),
);

console.log('Build complete successfully.');
