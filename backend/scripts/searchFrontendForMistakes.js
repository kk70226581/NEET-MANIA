const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDir(fullPath);
    } else {
      if (file.toLowerCase().includes('mistake') || file.toLowerCase().includes('notebook')) {
        console.log(`Found file: ${fullPath}`);
      }
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('/mistakes') || content.includes('MistakeNotebook') || content.includes('Mistake Notebook')) {
        console.log(`Found content reference in file: ${fullPath}`);
      }
    }
  }
}

try {
  searchDir('c:\\Users\\karan\\OneDrive\\Desktop\\NEET\\NEETP\\frontend\\src');
} catch (e) {
  console.error(e);
}
