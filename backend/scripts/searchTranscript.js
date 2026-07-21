const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\karan\\.gemini\\antigravity\\brain\\06514d81-d498-44fe-b71c-0999cfcf4fd7\\.system_generated\\logs\\transcript_full.jsonl';

try {
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n').filter(Boolean);
  console.log(`Searching in ${lines.length} lines...`);
  
  let foundCount = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes('units and measurements')) {
      foundCount++;
      const obj = JSON.parse(lines[i]);
      console.log(`Match ${foundCount}: step_index=${obj.step_index}, source=${obj.source}, type=${obj.type}, snippet=${lines[i].substring(0, 100)}`);
    }
  }
  console.log(`Found ${foundCount} matches.`);
} catch (e) {
  console.error(e);
}
