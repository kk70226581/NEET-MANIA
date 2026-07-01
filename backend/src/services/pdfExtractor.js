/**
 * PDF Question Extraction Service
 * Handles selectable-text PDFs and scanned/image PDFs.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');
const Tesseract = require('tesseract.js');
const pdf = require('pdf-parse');
const { getGeminiText } = require('./geminiClient');
const {
  PHYSICS_CHAPTERS,
  CHEMISTRY_CHAPTERS,
  BIOLOGY_CHAPTERS
} = require('../config/constants');

const execFileAsync = promisify(execFile);
const OPTION_KEYS = ['A', 'B', 'C', 'D'];

class PDFExtractor {
  static getQuestionExtractionPrompt(extractedText = '') {
    return `You are an expert NEET question parser. Analyze the provided ${extractedText ? 'text' : 'PDF'} and extract ALL questions in JSON format.

For EACH question, return:
{
  "questionNumber": "Q1",
  "questionText": "Complete question text in English",
  "questionTextHindi": "Complete question text in Hindi if available",
  "options": {
    "A": { "text": "Option A text" },
    "B": { "text": "Option B text" },
    "C": { "text": "Option C text" },
    "D": { "text": "Option D text" }
  },
  "correctAnswer": "A",
  "explanation": "Explanation of the answer",
  "type": "mcq",
  "difficulty": "medium",
  "learningObjective": "Concept being tested",
  "commonMistake": "Likely student error",
  "tags": ["NCERT concept", "key phrase"]
}

IMPORTANT RULES:
1. Extract EVERY question
2. Preserve exact wording
3. correctAnswer must be A, B, C, or D
4. If Hindi text is present, include questionTextHindi
5. Return ONLY valid JSON array, no markdown, no explanation outside JSON
6. For diagrams/images in the PDF, describe the diagram in questionText if it cannot be extracted as a separate URL
7. CRITICAL MATCH-THE-FOLLOWING INSTRUCTION: If a question is a "Match the following" or column-matching question (e.g., containing "Match Column", "Match list", or "Match the following"), you MUST reconstruct the side-by-side columns from the squished raw text. Identify the Column I items (starting with letters A., B., C., D.) and Column II items (starting with roman numerals (i), (ii), (iii), (iv) or numbers (1), (2), (3), (4)). Format them cleanly with newlines (\n) in the JSON questionText string so they display as two distinct lists, like this:
"Match the following and select the correct option:
Column I
A. Earthworm
B. Succession
C. Ecosystem service
D. Population growth

Column II
(i) Pioneer species
(ii) Detritivore
(iii) Natality
(iv) Pollination"

${extractedText ? `TEXT TO PARSE:\n${extractedText}\n` : ''}
Return valid JSON array only. Example format:
[
  { "questionNumber": "Q1", ... },
  { "questionNumber": "Q2", ... }
]`;
  }

  static shouldShuffleOptions(options = {}) {
    const skipKeywords = [
      'all of the above',
      'none of the above',
      'none of these',
      'both a and b',
      'both b and c',
      'both a and c',
      'both (a) and (b)',
      'both (b) and (c)',
      'neither a nor b',
      'all of these'
    ];
    for (const key of OPTION_KEYS) {
      const text = String(options[key]?.text || options[key] || '').toLowerCase();
      if (skipKeywords.some(kw => text.includes(kw))) {
        return false;
      }
    }
    return true;
  }

  static shuffleQuestion(q) {
    const currentCorrect = q.correctAnswer;
    if (!OPTION_KEYS.includes(currentCorrect)) return q;
    if (!this.shouldShuffleOptions(q.options)) return q;

    const items = OPTION_KEYS.map(k => {
      const val = q.options[k];
      return typeof val === 'string' ? { text: val } : { text: val?.text || '', image: val?.image };
    });

    const correctText = items[OPTION_KEYS.indexOf(currentCorrect)]?.text;

    // Fisher-Yates shuffle
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }

    const newOptions = {};
    let newCorrect = currentCorrect;

    OPTION_KEYS.forEach((key, idx) => {
      newOptions[key] = items[idx];
      if (items[idx]?.text === correctText) {
        newCorrect = key;
      }
    });

    return {
      ...q,
      options: newOptions,
      correctAnswer: newCorrect
    };
  }

  static normalizeQuestions(questions, metadata = {}) {
    const normalized = questions.map(q => {
      const rawOptions = Object.fromEntries(
        OPTION_KEYS.map((key) => {
          const val = q.options?.[key];
          let text = '';
          let image = undefined;

          if (typeof val === 'string') {
            text = val;
          } else if (val && typeof val === 'object') {
            text = val.text || '';
            image = val.image;
          }

          text = text.trim();
          if (!text) {
            text = `[Incomplete Option ${key}]`;
          }

          return [
            key,
            { text, image }
          ];
        })
      );

      const mapped = {
        ...q,
        options: rawOptions,
        explanation: typeof q.explanation === 'string' ? { text: q.explanation } : (q.explanation || { text: '' }),
        subject: (metadata.subject || 'biology').toLowerCase(),
        chapter: metadata.chapter || 'Unclassified',
        topic: metadata.topic || '',
        source: (metadata.source || 'custom').toLowerCase(),
        sourceDetails: {
          ...(metadata.sourceDetails || {}),
          ...(q.sourceDetails || {})
        }
      };

      // Shuffle options to distribute correct answers randomly
      return this.shuffleQuestion(mapped);
    });

    return normalized;
  }

  static cleanText(text = '') {
    return String(text)
      .replace(/\r/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  static extractAnswerKey(text = '') {
    const answers = {};
    const keySectionMatch = text.match(/(?:answer\s*key|answers?)[:\s-]*([\s\S]{0,5000})$/i);
    const source = keySectionMatch?.[1] || text;
    const answerPattern = /(?:^|\s)(?:Q\.?\s*)?(\d{1,3})\s*[\).:-]\s*[\(\[]?([A-D])[\)\]]?/gi;
    let match;

    while ((match = answerPattern.exec(source))) {
      answers[Number(match[1])] = match[2].toUpperCase();
    }

    return answers;
  }

  static splitQuestionBlocks(text = '') {
    const cleaned = this.cleanText(text);
    const candidates = [];
    const regex = /(?:^|\n)\s*(?:(question|ques|que|q)\s*\.?\s*(\d{1,3})\s*([\).:-]?)|(\d{1,3})\s*([\).:-]))\s+/gi;
    let rMatch;

    while ((rMatch = regex.exec(cleaned))) {
      const prefix = rMatch[1] || '';
      const number = rMatch[2] || rMatch[4];
      const marker = rMatch[3] || rMatch[5] || '';

      const normalizedMatch = {
        0: rMatch[0],
        1: prefix,
        2: number,
        3: marker,
        index: rMatch.index
      };

      if (this.isLikelyQuestionStart(cleaned, normalizedMatch)) {
        candidates.push(normalizedMatch);
      }
    }

    // Build a deduplicated, monotonically-increasing list of question start markers.
    const matches = [];

    candidates.forEach((match) => {
      const number = Number(match[2]);
      const lastNumber = Number(matches[matches.length - 1]?.[2] || 0);
      const delta = number - lastNumber;

      // Skip duplicate numbers
      if (number === lastNumber) return;

      // Skip if it looks like an option label stepping backward by a large amount
      if (delta < 0 && lastNumber > 10 && number <= 4) return;

      // Skip if it jumps forward by more than 15 (likely a stray number in text)
      if (delta > 15 && lastNumber > 0) return;

      matches.push(match);
    });

    if (!matches.length) return [];

    return matches.map((match, index) => {
      const start = match.index + match[0].length;
      const end = matches[index + 1]?.index ?? cleaned.length;

      return {
        number: Number(match[2]),
        text: cleaned.slice(start, end).trim()
      };
    // Keep blocks that are at least 10 chars and don't start with an option label alone
    }).filter(block => block.text.length > 10);
  }

  static isLikelyQuestionStart(text, match) {
    const prefix = match[1] || '';
    const marker = match[3] || '';
    const after = text.slice(match.index + match[0].length).trimStart();

    if (!/^[A-Z0-9"'\u2018\u201C]/.test(after)) return false;
    if (prefix.trim()) return true;

    if (!/[.)]/.test(marker)) return false;

    return true;
  }

  static parseOptions(blockText = '') {
    // Define list of possible option patterns in order of priority
    const patterns = [
      // (A) option1 (B) option2 (C) option3 (D) option4
      /(?:^|[^A-Z0-9])\(\s*([A-D])\s*\)\s+/gi,
      // A. option1 B. option2 C. option3 D. option4
      /(?:^|[^A-Z0-9])\b([A-D])\s*[\.\:\-]\s+/gi,
      // (1) option1 (2) option2 (3) option3 (4) option4
      /(?:^|[^A-Z0-9])\(\s*([1-4])\s*\)\s+/gi,
      // 1. option1 2. option2 3. option3 4. option4
      /(?:^|[^A-Z0-9])\b([1-4])\s*[\.\:\-]\s+/gi,
      // [A] option1 [B] option2 [C] option3 [D] option4
      /(?:^|[^A-Z0-9])\[\s*([A-D])\s*\]\s+/gi
    ];

    let bestMatches = [];
    let bestStartIndex = -1;

    for (const pattern of patterns) {
      const currentMatches = [...blockText.matchAll(pattern)]
        .map(match => ({
          key: this.normalizeOptionKey(match[1]),
          index: match.index,
          markerLength: match[0].length
        }))
        .filter((match, index, all) => OPTION_KEYS.includes(match.key) && all.findIndex(item => item.key === match.key) === index)
        .sort((a, b) => a.index - b.index);

      if (currentMatches.length === 4) {
        const firstIdx = currentMatches[0].index;
        if (firstIdx > bestStartIndex) {
          bestStartIndex = firstIdx;
          bestMatches = currentMatches;
        }
      }
    }

    // Fallback: if no pattern yields exactly 4 options, take the pattern with the most options
    if (bestMatches.length === 0) {
      let maxCount = -1;
      for (const pattern of patterns) {
        const currentMatches = [...blockText.matchAll(pattern)]
          .map(match => ({
            key: this.normalizeOptionKey(match[1]),
            index: match.index,
            markerLength: match[0].length
          }))
          .filter((match, index, all) => OPTION_KEYS.includes(match.key) && all.findIndex(item => item.key === match.key) === index)
          .sort((a, b) => a.index - b.index);

        if (currentMatches.length > maxCount) {
          maxCount = currentMatches.length;
          bestMatches = currentMatches;
        }
      }
    }

    const matches = bestMatches;

    const firstOptionIndex = matches.length > 0 ? matches[0].index : blockText.length;
    const questionText = blockText.slice(0, firstOptionIndex).trim();
    const options = {
      A: { text: '' },
      B: { text: '' },
      C: { text: '' },
      D: { text: '' }
    };

    OPTION_KEYS.forEach((key) => {
      const current = matches.find(match => match.key === key);
      if (!current) return;

      const currentIdxInMatches = matches.findIndex(match => match.key === key);
      const next = matches[currentIdxInMatches + 1];

      options[key] = {
        text: this.cleanOptionText(
          blockText.slice(current.index + current.markerLength, next?.index ?? blockText.length)
        )
      };
    });

    if (!questionText) return null;

    return { 
      questionText: this.cleanQuestionText(questionText), 
      options,
      hasIncompleteOptions: matches.length < 4
    };
  }

  static cleanQuestionText(text = '') {
    return String(text)
      .replace(/www\.[^\s]+/gi, ' ')
      .replace(/\bNEET[-\s]*AIPMT\s+Chapterwise\s+Topicwise\s+Solutions\b/gi, ' ')
      .replace(/\bChemistry\b\s*$/i, ' ')
      .replace(/\b\d+\.\d(?:\s+\d+\.\d){1,}\b/g, ' ')
      .replace(/\s+\d+\s+\d+\s*$/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  static cleanOptionText(text = '') {
    let cleaned = String(text);

    // 1. Truncate at answer/explanation markers bleeding into the option text
    const bleedPatterns = [
      /\s+(?:Ans\.?|Answer|Explanation)[:\s(].*$/i,
      /\s+\[?Ans\.?\s*[:.-]?\s*[A-D]\]?.*$/i,
      /\s+ANSWER\s+KEY.*$/i,
      // Cut off starting from formula symbols or variable assignments bleeding in
      /\s+(?:[=⇒∴]|\bLC\b).*$/g
    ];

    for (const pattern of bleedPatterns) {
      cleaned = cleaned.replace(pattern, '');
    }

    // 2. Truncate at a new question number start (e.g. "11 A student...")
    // This happens when the parser misses a question start match and lets it bleed into the previous option
    const nextQuestionPattern = /\s+\b\d{1,3}\b\s+[A-Z].*$/;
    cleaned = cleaned.replace(nextQuestionPattern, '');

    // 3. Remove standard year/cancellation metadata
    cleaned = cleaned
      .replace(/\s*\((?:NEET|AIPMT|Mains)?[-\sA-Z]*\s*(?:19|20)\d{2}(?:,\s*Cancelled)?\)\s*[\s\S]*$/i, '')
      .replace(/\s+\((?:19|20)\d{2}(?:,\s*Cancelled)?\)\s*[\s\S]*$/i, '');

    // 4. Remove trailing formula garbage or chapter names
    cleaned = cleaned
      .replace(/\s+\d+\.\d+\s+[\s\S]*$/g, '')
      .replace(/\s+(?:Properties of Matter|Uncertainty in Measurement|Laws of Chemical|Atomic and Molecular|Mole Concept|Percentage Composition|Stoichiometry)[\s\S]*$/i, '');

    // 5. Remove trailing debris of lone chars (e.g. "n 1 1")
    cleaned = cleaned.replace(/\s+[a-z0-9](?:\s+[a-z0-9]){1,4}$/i, '');

    return cleaned.replace(/\s+/g, ' ').trim();
  }

  static normalizeOptionKey(key = '') {
    const normalized = String(key).trim().toUpperCase();
    return {
      1: 'A',
      2: 'B',
      3: 'C',
      4: 'D'
    }[normalized] || normalized;
  }

  static parseQuestionsRuleBased(extractedText, metadata = {}) {
    const answerKey = this.extractAnswerKey(extractedText);
    const blocks = this.splitQuestionBlocks(extractedText);

    const questions = blocks.map((block) => {
      const parsed = this.parseOptions(block.text);
      if (!parsed) return null;

      // ── Quality gate ────────────────────────────────────────────────
      // Discard blocks where the question text is suspiciously short
      // (just a question number with no actual stem)
      const strippedText = parsed.questionText
        .replace(/^Q?\d{1,3}[\).:]?\s*/i, '')   // remove leading number
        .replace(/\s+/g, ' ')
        .trim();

      if (strippedText.length < 8) return null; // nothing meaningful

      // Count how many options have real content (not placeholder)
      const filledOptionCount = OPTION_KEYS.filter(
        key => parsed.options[key]?.text?.trim().length > 1
      ).length;

      // Discard if fewer than 2 options have any real content
      if (filledOptionCount < 2) return null;
      // ────────────────────────────────────────────────────────────────

      // Try to find inline answer patterns in block text
      // E.g., Ans. (A), Ans: A, Answer: A, [Ans. B]
      const inlineAnsPattern = /(?:ans(?:wer)?\.?\s*[:.-]?\s*[\(\[]?\s*([A-D])\s*[\)\]]?)/i;
      const inlineMatch = block.text.match(inlineAnsPattern);

      const correctAnswer = inlineMatch 
        ? inlineMatch[1].toUpperCase() 
        : (answerKey[block.number] || 'A');

      const needsAnswerReview = !inlineMatch && !answerKey[block.number];
      const needsOptionReview = parsed.hasIncompleteOptions;

      return {
        questionNumber: `Q${block.number}`,
        _blockNumber: block.number,
        questionText: parsed.questionText,
        options: parsed.options,
        correctAnswer,
        explanation: {
          text: needsAnswerReview
            ? 'Answer key was not detected automatically. Please verify the correct option before publishing.'
            : ''
        },
        type: 'mcq',
        difficulty: 'pending',  // AI will assign via auto-classify after upload
        tags: [
          'raw-import',
          needsAnswerReview ? 'needs-answer-review' : 'answer-key-detected',
          needsOptionReview ? 'needs-option-review' : 'options-detected'
        ],
        qualityScore: (needsAnswerReview || needsOptionReview) ? 35 : 55,
        sourceDetails: {
          ...(metadata.sourceDetails || {}),
          parser: 'rule-based',
          needsAnswerReview,
          needsOptionReview
        }
      };
    }).filter(Boolean);

    return this.normalizeQuestions(questions, metadata);
  }

  static parseJsonQuestions(content) {
    const jsonMatch = content.match(/\[[\s\S]*\]/);

    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response');
    }

    const jsonStr = jsonMatch[0];
    try {
      return JSON.parse(jsonStr);
    } catch (err) {
      console.warn('Initial JSON.parse failed. Retrying with repaired JSON...', err.message);
      // Replace raw newlines and control characters inside string values, escape lone backslashes
      const repaired = jsonStr
        .replace(/[\u0000-\u001F]+/g, '') // remove true control characters
        .replace(/\\(?!["\\\/bfnrtu])/g, '\\\\'); // escape lone backslashes
      return JSON.parse(repaired);
    }
  }

  static getPdfRendererCommand() {
    return process.env.PDF_RENDERER_PATH || 'pdftoppm';
  }

  static getPdfTextCommand() {
    if (process.env.PDF_TEXT_EXTRACTOR_PATH) return process.env.PDF_TEXT_EXTRACTOR_PATH;

    const renderer = this.getPdfRendererCommand();
    const derived = renderer.replace(/pdftoppm(?:\.exe)?$/i, process.platform === 'win32' ? 'pdftotext.exe' : 'pdftotext');

    if (derived !== renderer && fs.existsSync(derived)) return derived;

    return 'pdftotext';
  }

  static getPdfImagesCommand() {
    const renderer = this.getPdfRendererCommand();
    const derived = renderer.replace(/pdftoppm(?:\.exe)?$/i, process.platform === 'win32' ? 'pdfimages.exe' : 'pdfimages');

    if (derived !== renderer && fs.existsSync(derived)) return derived;

    return 'pdfimages';
  }

  static async extractImagesFromPdf(file) {
    const pdfImagesCmd = this.getPdfImagesCommand();
    const uploadDir = path.join(process.cwd(), 'uploads');
    const pdfBaseName = path.basename(file.path, path.extname(file.path));
    const targetDirName = `extracted-images-${pdfBaseName}-${Date.now()}`;
    const targetDir = path.join(uploadDir, targetDirName);
    fs.mkdirSync(targetDir, { recursive: true });

    try {
      console.log(`Extracting images from PDF: ${file.path} to ${targetDir}`);
      await execFileAsync(pdfImagesCmd, [
        '-png',
        file.path,
        path.join(targetDir, 'img')
      ], {
        windowsHide: true,
        maxBuffer: 100 * 1024 * 1024
      });

      // Run -list to get page number AND dimensions for each extracted image.
      // pdfimages -list columns (0-indexed after splitting on whitespace):
      //   0=page, 1=num, 2=type, 3=width, 4=height, 5=color, 6=comp, 7=bpc, 8=enc, 9=interp, 10=object, 11=ID, 12=x-ppi, 13=y-ppi, 14=size, 15=ratio
      const imageMetaMap = {}; // paddedBase (img-000) -> { page, width, height }
      try {
        const { stdout: listOut } = await execFileAsync(pdfImagesCmd, [
          '-list',
          file.path
        ], { windowsHide: true, maxBuffer: 5 * 1024 * 1024 });

        const listLines = listOut.split(/\r?\n/).slice(2); // skip two header rows
        let imgCounter = 0;
        listLines.forEach(line => {
          const cols = line.trim().split(/\s+/);
          if (cols.length >= 5 && /^\d+$/.test(cols[0])) {
            const pageNum = parseInt(cols[0], 10);
            const width   = parseInt(cols[3], 10) || 0;
            const height  = parseInt(cols[4], 10) || 0;
            const paddedIdx = String(imgCounter).padStart(3, '0');
            imageMetaMap[`img-${paddedIdx}`] = { page: pageNum, width, height };
            imgCounter++;
          }
        });
      } catch (_) {
        // list parsing is best-effort
      }

      // Minimum size threshold to consider an image a "real diagram".
      // Images smaller than this are icons, bullets, decorative lines, watermarks etc.
      const MIN_WIDTH  = parseInt(process.env.IMAGE_MIN_WIDTH  || '80', 10);
      const MIN_HEIGHT = parseInt(process.env.IMAGE_MIN_HEIGHT || '60', 10);

      const files = fs.readdirSync(targetDir);
      const images = files
        .filter(f => /\.(png|jpg|jpeg)$/i.test(f))
        .sort((a, b) => {
          const numA = parseInt(a.match(/\d+/)?.[0] || 0, 10);
          const numB = parseInt(b.match(/\d+/)?.[0] || 0, 10);
          return numA - numB;
        })
        .map(f => {
          const base = f.replace(/\.(png|jpg|jpeg)$/i, '');
          const meta = imageMetaMap[base] || {};
          return {
            url:    `/uploads/${targetDirName}/${f}`,
            page:   meta.page   || null,
            width:  meta.width  || 0,
            height: meta.height || 0
          };
        })
        // Filter out tiny decorative images
        .filter(img => img.width >= MIN_WIDTH && img.height >= MIN_HEIGHT);

      console.log(`Extracted ${images.length} usable diagram images from PDF (after filtering tiny icons).`);
      return { images, targetDirName };
    } catch (error) {
      console.error(`pdfimages extraction failed: ${error.message}`);
      try {
        if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length === 0) {
          fs.rmdirSync(targetDir);
        }
      } catch (_) {}
      return { images: [], targetDirName: null };
    }
  }

  /**
   * Auto-link diagram images to questions.
   *
   * Strategy:
   * 1. Only consider images that pass the size filter (already done in extractImagesFromPdf).
   * 2. Only link an image to a question if the question text HINTS at a diagram
   *    (keywords: figure, diagram, given below, shown, following figure, graph, etc.).
   *    This prevents decorative images from being noise-linked to every question.
   * 3. Match by page number: question on estimated page P → look for image on page P.
   * 4. Each image can only be used once (first-come, first-served).
   */
  static autoLinkImagesToQuestions(questions, images) {
    if (!images || !images.length) return questions;

    // Build page → available images map
    const pageImageMap = {};
    images.forEach(img => {
      if (!img.page) return;
      if (!pageImageMap[img.page]) pageImageMap[img.page] = [];
      pageImageMap[img.page].push(img.url);
    });

    if (!Object.keys(pageImageMap).length) return questions;

    // Keywords that strongly hint a question requires a visual diagram
    const DIAGRAM_HINT_PATTERN =
      /\b(figure|diagram|graph|circuit|shown|given\s+below|following\s+figure|given\s+in|refer\s+to|below\s+figure|image|picture|illustration|setup|apparatus|arrangement|structure|molecule|cell|tissue|organ)\b/i;

    questions.forEach(q => {
      // Only link if the question text itself hints at a diagram
      const questionText = q.questionText || '';
      if (!DIAGRAM_HINT_PATTERN.test(questionText)) return;

      // Estimate the page this question falls on
      const blockNum = q._blockNumber || parseInt((q.questionNumber || '').replace(/^Q/, ''), 10) || 0;
      const estimatedPage = Math.ceil(blockNum / 3);

      // Look on the estimated page and ±1 pages
      const pagesForQuestion = [
        estimatedPage,
        estimatedPage - 1,
        estimatedPage + 1
      ].filter(p => p > 0);

      for (const p of pagesForQuestion) {
        const imagesOnPage = pageImageMap[p];
        if (imagesOnPage && imagesOnPage.length) {
          const imgUrl = imagesOnPage.shift(); // consume this image
          q.image = { url: imgUrl, publicId: null, caption: 'Auto-linked diagram' };
          break;
        }
      }
    });

    return questions;
  }

  static joinTsvWords(words = []) {
    return words
      .sort((a, b) => a.left - b.left)
      .map(word => word.text)
      .join(' ')
      .replace(/\s+([,.:;?!%)\]])/g, '$1')
      .replace(/([(\[])\s+/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
  }

  static textFromPopplerTsv(tsv = '') {
    const pages = new Map();
    const pageWidths = new Map();
    const lines = new Map();
    const rows = String(tsv).split(/\r?\n/).slice(1);

    rows.forEach((row) => {
      if (!row.trim()) return;

      const columns = row.split('\t');
      const level = Number(columns[0]);
      const page = Number(columns[1]);
      const left = Number(columns[6]);
      const top = Number(columns[7]);
      const width = Number(columns[8]);
      const text = columns.slice(11).join('\t').trim();

      if (level === 1 && text === '###PAGE###') {
        pageWidths.set(page, width || 612);
        return;
      }

      if (level !== 5 || !text || /^#+[^#]+#+$/.test(text) || /^[\uF000-\uF8FF]+$/.test(text)) return;

      const key = [
        page,
        columns[2],
        columns[3],
        columns[4]
      ].join(':');

      if (!lines.has(key)) {
        lines.set(key, { page, top, left, words: [] });
      }

      const line = lines.get(key);
      line.top = Math.min(line.top, top);
      line.left = Math.min(line.left, left);
      line.words.push({ left, text });
    });

    for (const line of lines.values()) {
      const text = this.joinTsvWords(line.words);

      if (!text || /neetjee|mediit|telegram/i.test(text)) continue;
      if (!pages.has(line.page)) pages.set(line.page, []);

      pages.get(line.page).push({
        ...line,
        text
      });
    }

    return [...pages.entries()]
      .sort(([a], [b]) => a - b)
      .map(([page, pageLines]) => {
        const width = pageWidths.get(page) || 612;
        const midpoint = width * 0.48;
        const sorted = pageLines
          .sort((a, b) => {
            const aColumn = a.left < midpoint ? 0 : 1;
            const bColumn = b.left < midpoint ? 0 : 1;

            return aColumn - bColumn || a.top - b.top || a.left - b.left;
          });

        return sorted.map(line => line.text).join('\n');
      })
      .join('\n');
  }

  static async extractSelectablePdfText(file) {
    const candidates = await this.extractSelectablePdfTextCandidates(file);
    return candidates[0] || '';
  }

  static async extractSelectablePdfTextCandidates(file) {
    const candidates = [];

    try {
      const textCommand = this.getPdfTextCommand();
      const { stdout } = await execFileAsync(textCommand, [
        '-tsv',
        file.path,
        '-'
      ], {
        windowsHide: true,
        maxBuffer: 200 * 1024 * 1024  // 200 MB for large PDFs
      });
      const tsvText = this.cleanText(this.textFromPopplerTsv(stdout));

      if (tsvText.length > 100) candidates.push(tsvText);
    } catch (error) {
      if (process.env.PDF_DEBUG === 'true') {
        console.warn(`Poppler text extraction unavailable, using pdf-parse: ${error.message}`);
      }
    }

    const data = await pdf(fs.readFileSync(file.path), {
      max: 0  // parse all pages, no limit
    });
    const pdfParseText = data.text?.trim() || '';

    if (pdfParseText.length > 100) candidates.push(pdfParseText);

    return Array.from(new Set(candidates));
  }

  static async renderPdfPagesToImages(file) {
    const renderer = this.getPdfRendererCommand();
    const dpi = Math.max(100, Number(process.env.OCR_DPI) || 200);
    const maxPages = Math.max(1, Number(process.env.OCR_MAX_PAGES) || 500); // support large PDFs
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'solnut-ocr-'));
    const outputPrefix = path.join(tempDir, 'page');

    try {
      await execFileAsync(renderer, [
        '-r', String(dpi),
        '-png',
        '-f', '1',
        '-l', String(maxPages),
        file.path,
        outputPrefix
      ], {
        windowsHide: true,
        maxBuffer: 10 * 1024 * 1024
      });

      const images = fs.readdirSync(tempDir)
        .filter((name) => /^page-\d+\.png$/i.test(name))
        .sort((a, b) => Number(a.match(/\d+/)?.[0] || 0) - Number(b.match(/\d+/)?.[0] || 0))
        .map((name) => path.join(tempDir, name));

      if (!images.length) {
        throw new Error('PDF renderer did not create any page images');
      }

      return { tempDir, images };
    } catch (error) {
      fs.rmSync(tempDir, { recursive: true, force: true });

      if (error.code === 'ENOENT') {
        throw new Error('Local OCR needs Poppler pdftoppm installed. Install Poppler and add it to PATH, or set PDF_RENDERER_PATH in backend/.env.');
      }

      throw new Error(`PDF-to-image rendering failed: ${error.message}`);
    }
  }

  /**
   * Truncate document text before the Hints & Explanations / Solutions sections.
   * This prevents answer explanations from being parsed as new questions.
   */
  static cleanHintsAndExplanations(text = '') {
    const patterns = [
      /\n\s*(?:hints?\s*&\s*explanations?|detailed\s+solutions?|explanations?|solutions?|answer\s+keys?)\b/i
    ];
    
    let earliestIndex = text.length;
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match.index < earliestIndex && match.index > 800) { // keep first 800 chars min
        earliestIndex = match.index;
      }
    }
    
    if (earliestIndex < text.length) {
      console.log(`[Local Ingestion] Truncating document at index ${earliestIndex} to ignore Hints/Explanations page.`);
      return text.slice(0, earliestIndex);
    }
    return text;
  }

  static async extractTextFromScannedPdfWithLocalOcr(file) {
    const { tempDir, images } = await this.renderPdfPagesToImages(file);

    try {
      const pages = [];

      for (let index = 0; index < images.length; index += 1) {
        console.log(`OCR page ${index + 1}/${images.length}`);
        const result = await Tesseract.recognize(images[index], 'eng+hin');
        pages.push(`\n\n--- Page ${index + 1} ---\n${result.data.text || ''}`);
      }

      return this.cleanText(pages.join('\n'));
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }

  static async parseQuestionsFromFile(file, metadata = {}, options = {}) {
    // 1. Extract embedded images first
    const { images } = await this.extractImagesFromPdf(file);

    let extractedText = '';

    // 2. Extract text depending on file type
    if (file.mimetype !== 'application/pdf') {
      extractedText = await this.extractText(file);
    } else {
      extractedText = await this.extractSelectablePdfText(file);

      // If selectable text is too short, try local OCR
      if (extractedText.length <= 100) {
        if (options.allowLocalOcr || process.env.SCANNED_PDF_LOCAL_OCR === 'true') {
          extractedText = await this.extractTextFromScannedPdfWithLocalOcr(file);
        } else {
          throw new Error('This PDF appears to be scanned. Please enable "Run local OCR" or upload a selectable-text PDF.');
        }
      }
    }

    if (!extractedText || extractedText.trim().length <= 50) {
      throw new Error('Could not extract text from the file.');
    }

    // 3. Extract answer key mapping
    const answerKey = this.extractAnswerKey(extractedText);
    console.log(`Detected answer key containing ${Object.keys(answerKey).length} answers.`);

    let parsedQuestions = [];

    // 4. Decide whether to use AI or local parser
    if (options.useAiParsing) {
      console.log('AI Ingestion enabled. Proceeding with Gemini batch parsing...');
      const blocks = this.splitQuestionBlocks(extractedText);
      console.log(`Regex splitting found ${blocks.length} raw question blocks.`);
      const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

      if (blocks.length >= 5) {
        // Group blocks into batches of 20
        const batchSize = 20;
        const batches = [];
        for (let i = 0; i < blocks.length; i += batchSize) {
          batches.push(blocks.slice(i, i + batchSize));
        }

        console.log(`Parsing ${blocks.length} questions in ${batches.length} AI batches...`);

        for (let i = 0; i < batches.length; i++) {
          const batch = batches[i];
          console.log(`Processing question batch ${i + 1}/${batches.length}...`);
          try {
            const content = await getGeminiText({
              systemInstruction: 'You are an expert NEET question parser. Format questions and return a valid JSON array only.',
              prompt: this.getCleanQuestionPrompt(batch, answerKey, metadata.subject),
              maxOutputTokens: 8000,
              temperature: 0.1,
              responseMimeType: 'application/json'
            });
            const parsed = this.parseJsonQuestions(content);
            if (Array.isArray(parsed)) {
              parsedQuestions.push(...parsed);
            }
          } catch (error) {
            console.error(`AI parsing failed for batch ${i + 1}:`, error.message);
          }
          await delay(2000);
        }
      } else {
        // Fallback: split text page-by-page
        console.log('Regex splitting failed. Falling back to page-by-page AI extraction...');
        let pages = [];
        if (extractedText.includes('--- Page ')) {
          pages = extractedText.split(/\n+--- Page \d+ ---\n+/);
        } else if (extractedText.includes('\f')) {
          pages = extractedText.split('\f');
        } else {
          pages = [extractedText];
        }

        pages = pages.map(p => p.trim()).filter(p => p.length > 50);
        console.log(`Split text into ${pages.length} pages. Processing page-by-page...`);

        // Process 2 pages at a time to stay efficient and preserve context
        const pageBatchSize = 2;
        const pageBatches = [];
        for (let i = 0; i < pages.length; i += pageBatchSize) {
          pageBatches.push(pages.slice(i, i + pageBatchSize).join('\n\n--- Page Split ---\n\n'));
        }

        for (let i = 0; i < pageBatches.length; i++) {
          const pageText = pageBatches[i];
          console.log(`Processing page batch ${i + 1}/${pageBatches.length}...`);
          try {
            const content = await getGeminiText({
              systemInstruction: 'You are an expert NEET question parser. Extract questions and return a valid JSON array only.',
              prompt: this.getPageQuestionPrompt(pageText, answerKey, metadata.subject),
              maxOutputTokens: 8000,
              temperature: 0.1,
              responseMimeType: 'application/json'
            });
            const parsed = this.parseJsonQuestions(content);
            if (Array.isArray(parsed)) {
              parsedQuestions.push(...parsed);
            }
          } catch (error) {
            console.error(`AI page batch parsing failed for batch ${i + 1}:`, error.message);
          }
          await delay(2000);
        }
      }
    } else {
      console.log('Local Ingestion enabled (free, zero-AI). Proceeding with rule-based regex parsing...');
      const truncatedText = this.cleanHintsAndExplanations(extractedText);
      parsedQuestions = this.parseQuestionsRuleBased(truncatedText, metadata);
    }

    if (!parsedQuestions.length) {
      throw new Error('Failed to parse any questions from this file.');
    }

    let normalized = this.normalizeQuestions(parsedQuestions, metadata);

    // Auto-link images to questions by page number (zero manual work needed)
    if (images && images.length) {
      normalized = this.autoLinkImagesToQuestions(normalized, images);
      const linkedCount = normalized.filter(q => q.image?.url).length;
      if (linkedCount > 0) {
        console.log(`Auto-linked ${linkedCount} diagrams to questions.`);
      }
    }

    console.log(`Successfully parsed and normalized ${normalized.length} questions.`);

    return {
      questions: normalized,
      images: images.map(img => img.url || img)  // normalize image shape for frontend
    };
  }


  static async extractText(file) {
    if (file.mimetype === 'application/pdf') {
      const extractedText = await this.extractSelectablePdfText(file);
      if (extractedText && extractedText.trim().length > 100) return extractedText;
      throw new Error('This PDF appears to be scanned. Gemini direct PDF reading will be used by the PDF importer.');
    }

    return this.extractTextFromImage(file.path);
  }

  static async extractTextFromImage(imagePath) {
    try {
      console.log(`Extracting text from: ${imagePath}`);

      const result = await Tesseract.recognize(imagePath, 'eng+hin', {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      return result.data.text;
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  static async parseQuestionsUsingAI(extractedText, metadata = {}) {
    try {
      console.log('Parsing questions from extracted text using Gemini...');

      const content = await getGeminiText({
        systemInstruction: 'You are an expert NEET question extractor. Extract questions from text and return valid JSON only.',
        prompt: this.getQuestionExtractionPrompt(extractedText),
        maxOutputTokens: 12000,
        temperature: 0.1
      });

      return this.normalizeQuestions(this.parseJsonQuestions(content), metadata);
    } catch (error) {
      console.error('AI Parsing Error:', error);
      throw new Error(`Failed to parse questions using Gemini: ${error.message}`);
    }
  }

  static async parseQuestionsUsingGeminiPDF(file, metadata = {}) {
    try {
      console.log('Parsing scanned PDF directly with Gemini...');

      const content = await getGeminiText({
        systemInstruction: 'You are an expert NEET question extractor. Read the uploaded PDF, including scanned/image pages, and return valid JSON only.',
        parts: [
          {
            inline_data: {
              mime_type: file.mimetype || 'application/pdf',
              data: fs.readFileSync(file.path).toString('base64')
            }
          },
          { text: this.getQuestionExtractionPrompt() }
        ],
        maxOutputTokens: 12000,
        temperature: 0.1
      });

      return this.normalizeQuestions(this.parseJsonQuestions(content), metadata);
    } catch (error) {
      console.error('Scanned PDF Parsing Error:', error);
      throw new Error(`Failed to parse scanned PDF using Gemini: ${error.message}`);
    }
  }

  static async generateExplanation(question, correctAnswer, options) {
    try {
      const optionsText = Object.entries(options)
        .map(([key, value]) => `${key}. ${value?.text || value}`)
        .join('\n');

      const prompt = `You are a NEET tutor. Provide a clear, concise explanation for this question.

Question: ${question}

Options:
${optionsText}

Correct Answer: ${correctAnswer}

Provide:
1. Why this answer is correct (2-3 lines)
2. Why other options are wrong (1 line each)
3. A helpful tip or shortcut (1 line)

Keep it concise and student-friendly.`;

      return getGeminiText({
        prompt,
        maxOutputTokens: 800,
        temperature: 0.25
      });
    } catch (error) {
      console.error('Explanation Generation Error:', error);
      return 'Unable to generate explanation';
    }
  }

  static async verifyQuestions(questions) {
    return questions.map(q => ({
      ...q,
      isVerified: false,
      verifyStatus: 'pending'
    }));
  }

  static getCleanQuestionPrompt(blocks, answerKey = {}, subject = '') {
    const chapterLists = {
      physics: PHYSICS_CHAPTERS,
      chemistry: CHEMISTRY_CHAPTERS,
      biology: BIOLOGY_CHAPTERS,
      botany: BIOLOGY_CHAPTERS,
      zoology: BIOLOGY_CHAPTERS
    };
    const chapters = chapterLists[String(subject || '').toLowerCase()] || [
      ...PHYSICS_CHAPTERS,
      ...CHEMISTRY_CHAPTERS,
      ...BIOLOGY_CHAPTERS
    ];

    return `You are an expert NEET question parser. You will be given raw question text blocks. Convert them into fully complete, structured JSON question objects.
    
For EACH block:
1. Extract the question number (e.g., "Q1", "Q2") and complete questionText (ensure no truncated text).
2. Extract options A, B, C, and D. Ensure they are complete and contain the exact option text.
3. Identify the correct answer (A, B, C, or D). Use the provided answer key mapping if a matching number is found. If the answer key does not have it, try to solve and infer the correct answer.
4. Provide a detailed, step-by-step NEET-level explanation for the answer.
5. Classify the question:
   - "chapter": Must choose the most appropriate NCERT chapter from the list below.
   - "topic": A specific sub-topic or concept.
   - "difficulty": "easy", "medium", or "hard".
   - "tags": A JSON array of relevant keywords (e.g., "NCERT", "numerical", "conceptual").
6. CRITICAL MATCH-THE-FOLLOWING INSTRUCTION: If a question is a "Match the following" or column-matching question (e.g., containing "Match Column", "Match list", or "Match the following"), you MUST reconstruct the side-by-side columns from the squished raw text. Identify the Column I items (starting with letters A., B., C., D.) and Column II items (starting with roman numerals (i), (ii), (iii), (iv) or numbers (1), (2), (3), (4)). Format them cleanly with newlines (\n) in the JSON questionText string so they display as two distinct lists, like this:
Match the following and select the correct option:
Column I
A. Earthworm
B. Succession
C. Ecosystem service
D. Population growth

Column II
(i) Pioneer species
(ii) Detritivore
(iii) Natality
(iv) Pollination
7. Ensure all scientific symbols, subscripts, and superscripts are preserved or transcribed accurately.

Standard Chapter List:
${chapters.join(', ')}

Answer Key Mapping (Question Number -> Correct Option):
${JSON.stringify(answerKey, null, 2)}

Here are the raw question blocks to parse:
${JSON.stringify(blocks, null, 2)}

Return ONLY a valid JSON array of objects. Do not include markdown code block syntax (like \`\`\`json) or extra text outside the JSON.
Each object must follow this schema:
{
  "questionNumber": "Q1",
  "questionText": "Complete question text",
  "options": {
    "A": { "text": "Option A text" },
    "B": { "text": "Option B text" },
    "C": { "text": "Option C text" },
    "D": { "text": "Option D text" }
  },
  "correctAnswer": "A",
  "explanation": "Detailed explanation here",
  "chapter": "Chapter Name",
  "topic": "Topic Name",
  "difficulty": "medium",
  "tags": ["tag1", "tag2"]
}`;
  }

  static getPageQuestionPrompt(pageText, answerKey = {}, subject = '') {
    const chapterLists = {
      physics: PHYSICS_CHAPTERS,
      chemistry: CHEMISTRY_CHAPTERS,
      biology: BIOLOGY_CHAPTERS,
      botany: BIOLOGY_CHAPTERS,
      zoology: BIOLOGY_CHAPTERS
    };
    const chapters = chapterLists[String(subject || '').toLowerCase()] || [
      ...PHYSICS_CHAPTERS,
      ...CHEMISTRY_CHAPTERS,
      ...BIOLOGY_CHAPTERS
    ];

    return `You are an expert NEET question parser. Extract ALL multiple-choice questions (MCQs) from the following raw text of exam pages.
    
IMPORTANT RULES:
1. Extract EVERY question complete with its question text and options. Do not truncate text or options.
2. For each question, identify the question number (e.g. "Q1", "Q2" etc.) and match it with the correct answer from the provided answer key mapping. If the answer key does not have it, try to solve and infer the correct answer.
3. Provide a detailed NEET tutor explanation.
4. Classify the question: choose a chapter from the list below, write a specific topic name, difficulty level (easy/medium/hard), and relevant tags.
5. CRITICAL MATCH-THE-FOLLOWING INSTRUCTION: If a question is a "Match the following" or column-matching question (e.g., containing "Match Column", "Match list", or "Match the following"), you MUST reconstruct the side-by-side columns from the squished raw text. Identify the Column I items (starting with letters A., B., C., D.) and Column II items (starting with roman numerals (i), (ii), (iii), (iv) or numbers (1), (2), (3), (4)). Format them cleanly with newlines (\n) in the JSON questionText string so they display as two distinct lists, like this:
Match the following and select the correct option:
Column I
A. Earthworm
B. Succession
C. Ecosystem service
D. Population growth

Column II
(i) Pioneer species
(ii) Detritivore
(iii) Natality
(iv) Pollination

Standard Chapters:
${chapters.join(', ')}

Answer Key Mapping (Question Number -> Correct Option):
${JSON.stringify(answerKey, null, 2)}

Page Raw Text:
${pageText}

Return ONLY a valid JSON array of objects. Do not include markdown code block syntax (like \`\`\`json) or extra text outside the JSON.
Follow this schema:
[
  {
    "questionNumber": "Q1",
    "questionText": "Complete question text",
    "options": {
      "A": { "text": "Option A text" },
      "B": { "text": "Option B text" },
      "C": { "text": "Option B text" },
      "D": { "text": "Option B text" }
    },
    "correctAnswer": "A",
    "explanation": "Detailed explanation here",
    "chapter": "Chapter Name",
    "topic": "Topic Name",
    "difficulty": "medium",
    "tags": ["tag1", "tag2"]
  }
]`;
  }

  static getClassificationPrompt(questions = [], subject = '') {
    const chapterLists = {
      physics: PHYSICS_CHAPTERS,
      chemistry: CHEMISTRY_CHAPTERS,
      biology: BIOLOGY_CHAPTERS,
      botany: BIOLOGY_CHAPTERS,
      zoology: BIOLOGY_CHAPTERS
    };
    const chapters = chapterLists[String(subject || '').toLowerCase()] || [
      ...PHYSICS_CHAPTERS,
      ...CHEMISTRY_CHAPTERS,
      ...BIOLOGY_CHAPTERS
    ];
    const compactQuestions = questions.map((question, index) => ({
      id: String(question._id || question.id || index),
      subject: question.subject,
      questionText: question.questionText,
      options: Object.fromEntries(
        OPTION_KEYS.map((key) => [key, question.options?.[key]?.text || ''])
      )
    }));

    return `Classify and solve these NEET MCQs. Return ONLY a valid JSON array.

IMPORTANT JSON SAFETY RULES:
1. Ensure all string values (like explanation, topic, tags) have double quotes inside them properly escaped (e.g., use \\" instead of ").
2. Do not include any control characters (like raw tabs or unescaped newlines) inside the strings. Use \\n for newlines.
3. Return a clean, valid JSON array only.

For each item return:
{
  "id": "same id",
  "correctAnswer": "Solve the question and return the correct option letter: A, B, C, or D",
  "explanation": "Provide a step-by-step NEET tutor explanation for the correct answer",
  "chapter": "best NCERT chapter",
  "topic": "specific topic",
  "difficulty": "easy|medium|hard",
  "learningObjective": "short objective",
  "commonMistake": "short likely mistake",
  "tags": ["2-5 concise tags"],
  "inSyllabus": true|false,
  "trendingFrequency": "high|medium|low"
}

Use one of these chapters when possible:
${chapters.join(', ')}

Questions:
${JSON.stringify(compactQuestions)}`;
  }

  static sanitizeClassification(item = {}) {
    const difficulty = ['easy', 'medium', 'hard'].includes(String(item.difficulty || '').toLowerCase())
      ? String(item.difficulty).toLowerCase()
      : 'medium';

    const trendingFrequency = ['high', 'medium', 'low'].includes(String(item.trendingFrequency || '').toLowerCase())
      ? String(item.trendingFrequency).toLowerCase()
      : 'medium';

    const correctAnswer = ['A', 'B', 'C', 'D'].includes(String(item.correctAnswer || '').toUpperCase())
      ? String(item.correctAnswer).toUpperCase()
      : undefined;

    return {
      id: String(item.id || ''),
      correctAnswer,
      explanation: String(item.explanation || '').trim() || undefined,
      chapter: String(item.chapter || 'Unclassified').trim() || 'Unclassified',
      topic: String(item.topic || '').trim(),
      difficulty,
      learningObjective: String(item.learningObjective || '').trim(),
      commonMistake: String(item.commonMistake || '').trim(),
      tags: Array.isArray(item.tags)
        ? item.tags.map(tag => String(tag).trim()).filter(Boolean).slice(0, 6)
        : [],
      inSyllabus: item.inSyllabus !== false,
      trendingFrequency
    };
  }

  static async classifyQuestionBatch(questions = []) {
    if (!questions.length) return [];

    const subject = questions[0]?.subject || '';
    const content = await getGeminiText({
      prompt: this.getClassificationPrompt(questions, subject),
      maxOutputTokens: 4000,
      temperature: 0.1
    });

    return this.parseJsonQuestions(content).map(item => this.sanitizeClassification(item));
  }
}

module.exports = PDFExtractor;
