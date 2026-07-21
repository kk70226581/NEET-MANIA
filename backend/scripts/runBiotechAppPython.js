const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const rawPythonPath = 'c:\\Users\\karan\\OneDrive\\Desktop\\NEET\\NEETP\\backend\\scripts\\raw_biotech_app_script.py';
const tempPythonPath = 'c:\\Users\\karan\\OneDrive\\Desktop\\NEET\\NEETP\\backend\\scripts\\temp_biotech_app.py';
const jsonOutputPath = 'c:\\Users\\karan\\OneDrive\\Desktop\\NEET\\NEETP\\backend\\scripts\\biotech_app_questions.json';

try {
  const content = fs.readFileSync(rawPythonPath, 'utf8');
  const lines = content.split(/\r?\n/);

  const filteredLines = [];
  filteredLines.push('import json');
  filteredLines.push('qs = []');
  filteredLines.push('def add(q, opts, ans, exp, topic, level="NEET", typ="Single Correct MCQ"):');
  filteredLines.push('    qs.append(dict(q=q,opts=opts,ans=ans,exp=exp,topic=topic,level=level,type=typ))');

  let capture = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Detect start of data
    if (line.startsWith('base = [') || line.startsWith('more = [') || line.startsWith('more=[') || line.startsWith('med = [') || line.startsWith('med=[') || line.startsWith('diag = [') || line.startsWith('diag=[') || line.startsWith('animals = [') || line.startsWith('animals=[') || line.startsWith('ethics = [') || line.startsWith('ethics=[') || line.startsWith('stmt = [') || line.startsWith('stmt=[') || line.startsWith('ars = [') || line.startsWith('ars=[') || line.startsWith('matches = [') || line.startsWith('matches=[')) {
      capture = true;
    }
    
    if (capture) {
      // Stop capturing if we hit docx lines or assert lines
      if (line.startsWith('assert len(qs)') || line.startsWith('doc=Document()') || line.startsWith('doc = Document()')) {
        break; // STOP COMPLETELY
      }
      filteredLines.push(lines[i]); // keep original line with indentation
    }
  }

  // Add the JSON output block
  filteredLines.push('\nprint(json.dumps(qs))');

  fs.writeFileSync(tempPythonPath, filteredLines.join('\n'));
  console.log(`Wrote filtered python script to ${tempPythonPath}`);

  // Run the python script
  exec(`python "${tempPythonPath}"`, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing python: ${error}`);
      console.error(stderr);
      return;
    }
    
    // Save output JSON
    fs.writeFileSync(jsonOutputPath, stdout);
    console.log(`Saved ${JSON.parse(stdout).length} questions to ${jsonOutputPath}`);
  });

} catch (e) {
  console.error(e);
}
