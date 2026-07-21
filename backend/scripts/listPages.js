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
      console.log(`File: ${fullPath.replace('c:\\Users\\karan\\OneDrive\\Desktop\\NEET\\NEETP\\', '')}`);
    }
  }
}

try {
  searchDir('c:\\Users\\karan\\OneDrive\\Desktop\\NEET\\NEETP\\frontend\\src\\pages');
} catch (e) {
  console.error(e);
}
