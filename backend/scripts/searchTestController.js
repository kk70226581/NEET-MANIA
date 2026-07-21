const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\karan\\OneDrive\\Desktop\\NEET\\NEETP\\backend\\src\\controllers\\testController.js';

try {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  console.log(`Searching testController.js of length ${lines.length}...`);
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('MistakeNotebook') || lines[i].includes('mistake') || lines[i].includes('isCorrect')) {
      console.log(`Line ${i + 1}: ${lines[i].trim()}`);
    }
  }
} catch (e) {
  console.error(e);
}
