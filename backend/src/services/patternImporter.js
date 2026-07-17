const path = require('path');
const fs = require('fs');
const Question = require('../models/Question');
const PDFExtractor = require('./pdfExtractor');
const { PHYSICS_CHAPTERS, CHEMISTRY_CHAPTERS, BIOLOGY_CHAPTERS } = require('../config/constants');

const VALID_SOURCES = ['pyq', 'mock', 'dpp', 'ncert', 'coaching', 'custom'];

const normalizeName = (input = '') => String(input)
  .replace(/\.[^.]+$/, '')
  .replace(/[_\-]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const escapeRegExp = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

class PatternImporter {
  static getPatternDirectory() {
    const configured = process.env.PATTERN_DIR;
    if (configured) {
      return path.resolve(process.cwd(), configured);
    }

    return path.resolve(__dirname, '..', '..', '..', 'PATTERN');
  }

  static detectSubject(filename = '') {
    const name = String(filename).toLowerCase();
    if (/\b(biology|bio|botany|zoology)\b/i.test(name)) return 'biology';
    if (/\b(chemistry|chem)\b/i.test(name)) return 'chemistry';
    if (/\b(physics|phy)\b/i.test(name)) return 'physics';
    return 'biology';
  }

  static detectSource(filename = '') {
    const name = String(filename).toLowerCase();
    if (/\b(pyq|previous|past|neet previous year|neet pyq)\b/.test(name)) return 'pyq';
    if (/\b(mock|sample|practice|test paper)\b/.test(name)) return 'mock';
    if (/\b(dpp|daily practice|daily practice paper)\b/.test(name)) return 'dpp';
    if (/\b(ncert)\b/.test(name)) return 'ncert';
    if (/\b(allen|aakash|fiitjee|resonance|motion|coaching)\b/.test(name)) return 'coaching';
    return 'custom';
  }

  static findKnownChapter(filename = '', subject = 'biology') {
    const text = normalizeName(filename).toLowerCase();
    const list = subject === 'physics'
      ? PHYSICS_CHAPTERS
      : subject === 'chemistry'
        ? CHEMISTRY_CHAPTERS
        : BIOLOGY_CHAPTERS;

    for (const chapter of list) {
      const lower = chapter.toLowerCase();
      if (text.includes(lower) || lower.includes(text) || text.includes(lower.replace(/\s+/g, ''))) {
        return chapter;
      }
    }

    return null;
  }

  static deriveChapter(filename = '', subject = 'biology') {
    const known = this.findKnownChapter(filename, subject);
    if (known) return known;

    const normalized = normalizeName(filename);
    if (normalized.length > 0) return normalized;
    return 'Unclassified';
  }

  static deriveTopic(filename = '', chapter = '') {
    const normalized = normalizeName(filename);
    if (!chapter) return '';
    const chapterRegex = new RegExp(escapeRegExp(chapter), 'i');
    const topic = normalized.replace(chapterRegex, '').replace(/\b(physics|chemistry|biology|botany|zoology|pyq|mock|ncert|coaching|dpp|past|paper|question|set)\b/gi, '').trim();
    return topic.length > 0 ? topic : '';
  }

  static async collectPdfFiles(directory) {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        files.push(...await this.collectPdfFiles(entryPath));
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) {
        files.push(entryPath);
      }
    }

    return files;
  }

  static async isDuplicate(question, metadata) {
    if (!question?.questionText) return false;
    const trimmed = question.questionText.trim();
    if (!trimmed) return false;

    return Boolean(await Question.exists({
      subject: metadata.subject,
      chapter: metadata.chapter,
      topic: metadata.topic,
      correctAnswer: question.correctAnswer,
      questionText: trimmed
    }));
  }

  static normalizeQuestionPayload(question) {
    const options = {};
    ['A', 'B', 'C', 'D'].forEach((key) => {
      options[key] = {
        text: String(question.options?.[key]?.text || question.options?.[key] || '').trim() || `Option ${key}`
      };
    });

    const explanationText = typeof question.explanation === 'string'
      ? question.explanation
      : question.explanation?.text || '';

    return {
      questionText: String(question.questionText || '').trim(),
      options,
      correctAnswer: ['A', 'B', 'C', 'D'].includes(String(question.correctAnswer || '').toUpperCase())
        ? String(question.correctAnswer).toUpperCase()
        : 'A',
      explanation: { text: String(explanationText).trim() },
      difficulty: ['easy', 'medium', 'hard'].includes(String(question.difficulty || '').toLowerCase())
        ? String(question.difficulty).toLowerCase()
        : 'medium',
      type: String(question.type || 'mcq').toLowerCase(),
      tags: Array.isArray(question.tags) ? question.tags.filter(Boolean) : []
    };
  }

  static getMetadataForFile(pdfPath, options = {}) {
    const fileName = path.basename(pdfPath);
    const subject = options.subject || this.detectSubject(fileName);
    const chapter = options.chapter || this.deriveChapter(fileName, subject);
    const folder = path.basename(path.dirname(pdfPath));
    const topicFromFolder = folder !== path.basename(this.getPatternDirectory()) ? normalizeName(folder) : '';
    const topic = options.topic || this.deriveTopic(fileName, chapter) || topicFromFolder || '';
    const source = VALID_SOURCES.includes(options.source) ? options.source : this.detectSource(fileName);

    return {
      subject,
      chapter,
      topic,
      source,
      sourceDetails: {
        testName: fileName,
        examType: 'neet',
        libraryPath: pdfPath
      }
    };
  }

  static async processFile(pdfPath, options = {}) {
    const metadata = this.getMetadataForFile(pdfPath, options);
    const summary = {
      file: pdfPath,
      subject: metadata.subject,
      chapter: metadata.chapter,
      topic: metadata.topic,
      source: metadata.source,
      parsed: 0,
      inserted: 0,
      skipped: 0,
      errors: []
    };

    const fileObject = {
      path: pdfPath,
      originalname: path.basename(pdfPath),
      mimetype: 'application/pdf'
    };

    try {
      const result = await PDFExtractor.parseQuestionsFromFile(fileObject, metadata, {
        allowLocalOcr: options.allowLocalOcr === true,
        useAiParsing: options.useAiParsing !== false
      });

      const questions = Array.isArray(result.questions) ? result.questions : [];
      summary.parsed = questions.length;
      const insertedDocs = [];

      const seenHashes = new Set();
      for (const rawQuestion of questions) {
        const normalized = this.normalizeQuestionPayload(rawQuestion);
        if (!normalized.questionText) {
          summary.skipped += 1;
          continue;
        }

        const uniqueHash = `${normalized.questionText.trim().slice(0, 300)}|${normalized.correctAnswer}`;
        if (seenHashes.has(uniqueHash)) {
          summary.skipped += 1;
          continue;
        }
        seenHashes.add(uniqueHash);

        const duplicate = options.skipDuplicates !== false
          ? await this.isDuplicate(normalized, metadata)
          : false;

        if (duplicate) {
          summary.skipped += 1;
          continue;
        }

        const payload = {
          ...normalized,
          ...metadata,
          source: metadata.source,
          sourceDetails: metadata.sourceDetails,
          inSyllabus: true,
          trendingFrequency: normalized.difficulty === 'hard' ? 'high' : normalized.difficulty === 'easy' ? 'low' : 'medium',
          isPublished: options.publish === true,
          isVerified: options.publish === true,
          tags: Array.from(new Set([...(normalized.tags || []), 'auto-import'])),
          pyq: { isPYQ: metadata.source === 'pyq' },
          uploadedBy: options.uploadedBy,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        insertedDocs.push(payload);
      }

      if (insertedDocs.length > 0) {
        const inserted = await Question.insertMany(insertedDocs, { ordered: false });
        summary.inserted = inserted.length;
      }
    } catch (error) {
      summary.errors.push(error.message || 'Unknown parsing error');
    }

    return summary;
  }

  static async importPath(targetPath, options = {}) {
    const absolutePath = path.resolve(targetPath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Path does not exist: ${absolutePath}`);
    }

    const stats = fs.statSync(absolutePath);
    if (stats.isDirectory()) {
      return this.importDirectory(absolutePath, options);
    }

    const fileSummary = await this.processFile(absolutePath, options);
    return {
      filesProcessed: 1,
      totalParsed: fileSummary.parsed,
      totalInserted: fileSummary.inserted,
      totalSkipped: fileSummary.skipped,
      errors: fileSummary.errors,
      detail: [fileSummary]
    };
  }

  static async importDirectory(directory, options = {}) {
    const pdfFiles = await this.collectPdfFiles(directory);
    const details = [];
    let totalParsed = 0;
    let totalInserted = 0;
    let totalSkipped = 0;

    for (const pdfPath of pdfFiles) {
      const summary = await this.processFile(pdfPath, options);
      details.push(summary);
      totalParsed += summary.parsed;
      totalInserted += summary.inserted;
      totalSkipped += summary.skipped;
    }

    return {
      filesProcessed: pdfFiles.length,
      totalParsed,
      totalInserted,
      totalSkipped,
      errors: details.flatMap(entry => entry.errors || []),
      detail: details
    };
  }
}

module.exports = PatternImporter;
