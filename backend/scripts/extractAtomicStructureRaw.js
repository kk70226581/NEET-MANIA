const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\karan\\.gemini\\antigravity\\brain\\06514d81-d498-44fe-b71c-0999cfcf4fd7\\.system_generated\\logs\\transcript_full.jsonl';

try {
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n').filter(Boolean);
  console.log(`Total lines in full transcript: ${lines.length}`);
  
  // Find the last line that has type "USER_INPUT"
  let lastUserLine = null;
  for (let i = lines.length - 1; i >= 0; i--) {
    const obj = JSON.parse(lines[i]);
    if (obj.type === 'USER_INPUT') {
      lastUserLine = obj;
      break;
    }
  }

  if (lastUserLine) {
    console.log('FOUND USER INPUT!');
    console.log(`Content length: ${lastUserLine.content.length}`);
    const outputPath = 'c:\\Users\\karan\\OneDrive\\Desktop\\NEET\\NEETP\\backend\\scripts\\atomic_structure_raw.txt';
    fs.writeFileSync(outputPath, lastUserLine.content);
    console.log(`Saved raw atomic structure questions to ${outputPath}`);
  } else {
    console.log('User input not found.');
  }

} catch (error) {
  console.error(error);
}
