const fs = require('fs');
const transcriptPath = 'C:\\\\Users\\\\karan\\\\.gemini\\\\antigravity\\\\brain\\\\06514d81-d498-44fe-b71c-0999cfcf4fd7\\\\.system_generated\\\\logs\\\\transcript_full.jsonl';
const transcript = fs.readFileSync(transcriptPath, 'utf8').trim().split('\n');

let foundStr = '';
for (let i = transcript.length - 1; i >= 0; i--) {
  try {
    const line = JSON.parse(transcript[i]);
    if (line.content && line.content.includes('"Question ID": 100')) {
      foundStr = line.content;
      break;
    }
  } catch(e) {}
}

if (foundStr) {
  const start = foundStr.indexOf('[');
  const end = foundStr.lastIndexOf(']');
  if (start !== -1 && end !== -1 && start < end) {
    const jsonStr = foundStr.substring(start, end + 1);
    fs.writeFileSync('C:\\\\Users\\\\karan\\\\OneDrive\\\\Desktop\\\\NEET\\\\NEETP\\\\backend\\\\scripts\\\\work_energy_power_raw.json', jsonStr);
    console.log('Successfully wrote work_energy_power_raw.json');
  } else {
    console.log('Found string but no JSON array.');
  }
} else {
  console.log('Could not find "Question ID": 100 in transcript.');
}
