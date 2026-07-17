const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');
const { promisify } = require('util');
const Tesseract = require('tesseract.js');

const execFileAsync = promisify(execFile);
const PDF_RENDERER_PATH = 'C:\\poppler-26.02.0\\Library\\bin\\pdftoppm.exe';

async function testLocalOCR() {
  const pdfPath = path.join(__dirname, '../../../PATTERN/botany-neet-ncert-line-by-line-ncert-line-by_compress.pdf');
  const tempDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'ocr-test-'));
  const outputPrefix = path.join(tempDir, 'page');

  try {
    console.log(`Rendering page 12 of PDF to image...`);
    await execFileAsync(PDF_RENDERER_PATH, [
      '-png',
      '-r', '200', // 200 DPI for Tesseract
      '-f', '12',
      '-l', '12',
      pdfPath,
      outputPrefix
    ], { windowsHide: true });

    const pageImages = fs.readdirSync(tempDir).filter(f => f.endsWith('.png'));
    if (pageImages.length === 0) throw new Error("No image generated.");
    
    const imagePath = path.join(tempDir, pageImages[0]);
    console.log(`Running Tesseract OCR on ${imagePath}...`);
    
    const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
      logger: m => console.log(m.status, Math.round(m.progress * 100) + '%')
    });
    
    console.log("\n--- OCR Text Output ---");
    console.log(text);
    console.log("-----------------------\n");
    
  } catch (error) {
    console.error("Error during OCR:", error);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

testLocalOCR();
