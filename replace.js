const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content
    .replace(/\.kiro/g, '.agent')
    .replace(/kiro/g, 'agent')
    .replace(/Kiro/g, 'Agent')
    .replace(/KIRO/g, 'AGENT');
    
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!['node_modules', 'dist', '.git'].includes(file)) {
        walkDir(fullPath);
      }
    } else {
      if (['.ts', '.md', '.json'].includes(path.extname(fullPath))) {
        replaceInFile(fullPath);
      }
    }
  }
}

walkDir(__dirname);
console.log('Replacement complete.');
