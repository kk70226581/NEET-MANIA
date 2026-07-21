const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\karan\\.gemini\\antigravity\\brain\\06514d81-d498-44fe-b71c-0999cfcf4fd7\\.system_generated\\logs\\transcript_full.jsonl';

try {
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n').filter(Boolean);
  
  let targetUserLine = null;
  for (let i = lines.length - 1; i >= 0; i--) {
    const obj = JSON.parse(lines[i]);
    if (obj.type === 'USER_INPUT' && obj.content.includes('Units and Measurements')) {
      targetUserLine = obj;
      break;
    }
  }

  if (targetUserLine) {
    console.log('FOUND UNITS AND MEASUREMENTS INPUT!');
    console.log(`Content length: ${targetUserLine.content.length}`);
    const outputPath = 'c:\\Users\\karan\\OneDrive\\Desktop\\NEET\\NEETP\\backend\\scripts\\units_measurements_raw.txt';
    fs.writeFileSync(outputPath, targetUserLine.content);
    console.log(`Saved raw units and measurements questions to ${outputPath}`);
  } else {
    console.log('Units and Measurements user input not found.');
  }

} catch (error) {
  console.error(error);
}
