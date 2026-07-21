const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\karan\\.gemini\\antigravity\\brain\\06514d81-d498-44fe-b71c-0999cfcf4fd7\\.system_generated\\logs\\transcript_full.jsonl';

try {
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n').filter(Boolean);
  console.log(`Total lines: ${lines.length}`);
  for (let i = 0; i < lines.length; i++) {
    const obj = JSON.parse(lines[i]);
    console.log(`Line ${i + 1}: step_index=${obj.step_index}, source=${obj.source}, type=${obj.type}`);
  }
} catch (e) {
  console.error(e);
}
