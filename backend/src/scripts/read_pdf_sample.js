const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

async function readSample() {
  const pdfPath = path.join(__dirname, '../../../PATTERN/botany-neet-ncert-line-by-line-ncert-line-by_compress.pdf');
  const dataBuffer = fs.readFileSync(pdfPath);
  
  const options = {
    max: 15 // only read up to page 15
  };
  
  try {
    const data = await pdfParse(dataBuffer, options);
    console.log("--- Extracted Text Start ---");
    console.log(data.text.substring(0, 5000)); // Print first 5000 characters
    console.log("--- Extracted Text End ---");
  } catch (error) {
    console.error("Error parsing PDF:", error);
  }
}

readSample();
