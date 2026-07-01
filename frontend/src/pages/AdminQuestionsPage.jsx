/**
 * Admin Questions Page — File-explorer style workspace
 * Completely separate from the student UI. Admin-only.
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  AlertTriangle, Brain, CheckCircle2, ChevronDown, ChevronRight,
  Database, Edit2, File, FileText, FileUp, Folder, FolderOpen,
  RefreshCw, Save, Search, ShieldCheck, Sparkles,
  Trash2, X, Zap, BarChart2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { questionsAPI } from '../services/api';
import './AdminWorkspace.css';

// ── NEET syllabus tree (subject → chapters) ─────────────────────────────────
// ── Full NEET syllabus: subject → class → unit → chapters ───────────────────
const SYLLABUS = {
  Physics: {
    'Class 11': {
      'Unit I: Physical World & Measurement':       ['Measurement'],
      'Unit II: Kinematics':                        ['Motion in a Straight Line','Motion in a Plane'],
      'Unit III: Laws of Motion':                   ['Laws of Motion'],
      'Unit IV: Work, Energy & Power':              ['Work Energy and Power'],
      'Unit V: Motion of System of Particles':      ['System of Particles and Rotational Motion'],
      'Unit VI: Gravitation':                       ['Gravitation'],
      'Unit VII: Properties of Bulk Matter':        ['Mechanical Properties of Solids','Mechanical Properties of Fluids','Thermal Properties of Matter'],
      'Unit VIII: Thermodynamics':                  ['Thermodynamics'],
      'Unit IX: Kinetic Theory of Gases':           ['Kinetic Theory'],
      'Unit X: Oscillations & Waves':               ['Oscillations','Waves'],
    },
    'Class 12': {
      'Unit I: Electrostatics':                     ['Electric Charges and Fields','Electrostatic Potential and Capacitance'],
      'Unit II: Current Electricity':               ['Current Electricity'],
      'Unit III: Magnetic Effects of Current':      ['Moving Charges and Magnetism','Magnetism and Matter'],
      'Unit IV: Electromagnetic Induction & AC':    ['Electromagnetic Induction','Alternating Current'],
      'Unit V: Electromagnetic Waves':              ['Electromagnetic Waves'],
      'Unit VI: Optics':                            ['Ray Optics and Optical Instruments','Wave Optics'],
      'Unit VII: Dual Nature of Matter':            ['Dual Nature of Radiation and Matter'],
      'Unit VIII: Atoms & Nuclei':                  ['Atoms','Nuclei'],
      'Unit IX: Electronic Devices':                ['Semiconductor Electronics'],
    },
  },
  Chemistry: {
    'Class 11': {
      'Unit I: Some Basic Concepts':                ['Some Basic Concepts of Chemistry'],
      'Unit II: Structure of Atom':                 ['Structure of Atom'],
      'Unit III: Classification of Elements':       ['Classification of Elements and Periodicity in Properties'],
      'Unit IV: Chemical Bonding':                  ['Chemical Bonding and Molecular Structure'],
      'Unit V: States of Matter':                   ['States of Matter'],
      'Unit VI: Thermodynamics':                    ['Thermodynamics'],
      'Unit VII: Equilibrium':                      ['Equilibrium'],
      'Unit VIII: Redox Reactions':                 ['Redox Reactions'],
      'Unit IX: Hydrogen':                          ['Hydrogen'],
      'Unit X: s-Block Elements':                   ['The s-Block Elements'],
      'Unit XI: p-Block Elements (Gr 13 & 14)':     ['The p-Block Elements'],
      'Unit XII: Organic Chemistry – Basics':       ['Organic Chemistry - Some Basic Principles and Techniques'],
      'Unit XIII: Hydrocarbons':                    ['Hydrocarbons'],
      'Unit XIV: Environmental Chemistry':          ['Environmental Chemistry'],
    },
    'Class 12': {
      'Unit I: Solid State':                        ['The d- and f-Block Elements'],
      'Unit II: Solutions':                         ['Coordination Compounds'],
      'Unit III: Electrochemistry':                 ['Surface Chemistry'],
      'Unit IV: Chemical Kinetics':                 ['General Principles and Processes of Isolation of Elements'],
      'Unit V: Surface Chemistry':                  ['The p-Block Elements (Group 13 & 14)'],
      'Unit VI: p-Block Elements':                  ['The p-Block Elements (Group 15, 16, 17, 18)'],
      'Unit VII: d & f Block / Coordination':       ['Alcohols, Phenols and Ethers'],
      'Unit VIII: Haloalkanes & Haloarenes':        ['Aldehydes, Ketones and Carboxylic Acids'],
      'Unit IX: Alcohols, Phenols & Ethers':        ['Organic Compounds Containing Nitrogen'],
      'Unit X: Aldehydes & Ketones':                ['Biomolecules'],
      'Unit XI: Organic Nitrogen Compounds':        ['Polymers'],
      'Unit XII: Biomolecules & Polymers':          ['Chemistry in Everyday Life'],
    },
  },
  Biology: {
    'Class 11': {
      'Unit I: Diversity of Living Organisms':      ['Diversity of Living Organisms'],
      'Unit II: Structural Organisation':           ['Structural Organisation in Animals and Plants'],
      'Unit III: Cell Structure & Function':        ['Cell Structure and Function'],
      'Unit IV: Plant Physiology':                  ['Plant Physiology','Photosynthesis','Respiration','Growth and Development'],
      'Unit V: Human Physiology':                   ['Human Physiology','Digestion and Absorption','Breathing and Exchange of Gases',
                                                     'Body Fluids and Circulation','Excretory Products and their Elimination',
                                                     'Locomotion and Movement','Neural Control and Coordination',
                                                     'Chemical Coordination and Integration'],
    },
    'Class 12': {
      'Unit VI: Reproduction':                      ['Reproduction in Plants','Reproduction in Animals','Reproduction in Humans'],
      'Unit VII: Genetics & Evolution':             ['Genetics','Molecular Basis of Inheritance','Evolution'],
      'Unit VIII: Biology & Human Welfare':         ['Immune System'],
      'Unit IX: Biotechnology':                     [],
      'Unit X: Ecology':                            ['Ecology','Biodiversity and its Conservation'],
    },
  },
};

const SUBJECT_COLORS = {
  physics:   { accent: '#3b82f6', light: '#eff6ff', border: '#bfdbfe', badge: '#1d4ed8' },
  chemistry: { accent: '#8b5cf6', light: '#f5f3ff', border: '#ddd6fe', badge: '#6d28d9' },
  biology:   { accent: '#10b981', light: '#ecfdf5', border: '#a7f3d0', badge: '#065f46' },
  botany:    { accent: '#10b981', light: '#ecfdf5', border: '#a7f3d0', badge: '#065f46' },
  zoology:   { accent: '#06b6d4', light: '#ecfeff', border: '#a5f3fc', badge: '#0e7490' },
};

const DIFF_COLORS = {
  easy:    { bg: '#dcfce7', text: '#166534' },
  medium:  { bg: '#fef9c3', text: '#713f12' },
  hard:    { bg: '#fee2e2', text: '#991b1b' },
  pending: { bg: '#e2e8f0', text: '#475569' },
};

// Returns flat chapter list for a subject (for AI prompts, search, etc.)
// const chaptersFor = (subject = '') => {
//   const key = subject.charAt(0).toUpperCase() + subject.slice(1).toLowerCase();
//   const subj = key === 'Botany' || key === 'Zoology' ? 'Biology' : key;
//   const data = SYLLABUS[subj] || {};
//   return Object.values(data).flatMap(units => Object.values(units).flat());
// };

// Chapter select — grouped by "Class 11 › Unit" using single-level <optgroup>
const ChapterSelect = ({ subject, value, onChange, allowAiSegregated = false }) => {
  const key = (subject || '').charAt(0).toUpperCase() + (subject || '').slice(1).toLowerCase();
  const subj = key === 'Botany' || key === 'Zoology' ? 'Biology' : key;
  const data = SYLLABUS[subj] || {};

  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
        Chapter *
      </span>
      <select
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        style={{ padding: '5px 8px', border: '1.5px solid #334155', borderRadius: 6, fontSize: 12, background: '#0f172a', color: '#e2e8f0' }}
      >
        <option value="">— select chapter —</option>
        {allowAiSegregated && (
          <option value="ai-segregated" style={{ fontWeight: 'bold', color: '#34d399' }}>
            ✨ let AI segregate chapters (Multi-Chapter)
          </option>
        )}
        {Object.entries(data).map(([classLabel, units]) =>
          Object.entries(units).map(([unitLabel, chapters]) =>
            chapters.length > 0 ? (
              <optgroup key={`${classLabel}/${unitLabel}`} label={`${classLabel}  ›  ${unitLabel}`}>
                {chapters.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </optgroup>
            ) : null
          )
        )}
      </select>
    </label>
  );
};

const TREND_COLORS = {
  high:   { bg: '#fee2e2', text: '#991b1b', label: '🔥 High' },
  medium: { bg: '#fef9c3', text: '#713f12', label: '⚡ Medium' },
  low:    { bg: '#e2e8f0', text: '#475569', label: '📦 Low' },
};

// ── Tiny inline editable field ──────────────────────────────────────────────
const InlineField = ({ label, value, onChange, type = 'text', options }) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
      {label}
    </span>
    {options ? (
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ padding: '5px 8px', border: '1.5px solid #e2e8f0', borderRadius: 6, fontSize: 12, background: '#fff' }}
      >
        {options.map(o => (
          <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        style={{ padding: '5px 8px', border: '1.5px solid #e2e8f0', borderRadius: 6, fontSize: 12 }}
      />
    )}
  </label>
);

// ── Single published question row ────────────────────────────────────────────
const QuestionRow = ({ question, index, onDelete, onSave, onAiFix, fixingId, savingId }) => {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(question);

  const colors = SUBJECT_COLORS[(question.subject || 'biology').toLowerCase()] || SUBJECT_COLORS.biology;
  const isBusy = savingId === question._id || fixingId === question._id;

  const set = (field, val) => setDraft(d => ({ ...d, [field]: val }));
  const setOpt = (key, val) => setDraft(d => ({
    ...d, options: { ...d.options, [key]: { ...(d.options?.[key] || {}), text: val } }
  }));

  const handleSave = async () => {
    await onSave(draft);
    setEditing(false);
  };


  return (
    <div className="aw-qrow" style={{ borderLeft: `4px solid ${colors.accent}` }}>
      {/* ── Row header ── */}
      <div className="aw-qrow-header" onClick={() => !editing && setExpanded(e => !e)}>
        <span className="aw-qnum" style={{ background: colors.accent }}>Q{index}</span>
        <span className="aw-qtext-preview">
          {(draft.questionText || '').slice(0, 100)}{(draft.questionText || '').length > 100 ? '…' : ''}
        </span>
        <div className="aw-qrow-tags">
          <span className="aw-tag" style={DIFF_COLORS[draft.difficulty] || DIFF_COLORS.medium}>
            {draft.difficulty === 'pending' ? '⏳ AI Pending' : draft.difficulty}
          </span>
          <span className="aw-tag" style={TREND_COLORS[draft.trendingFrequency]}>
            {TREND_COLORS[draft.trendingFrequency]?.label || 'Medium'}
          </span>
          {draft.inSyllabus === false && (
            <span className="aw-tag" style={{ bg: '#fee2e2', text: '#991b1b' }}>Out of Syllabus</span>
          )}
          <span className="aw-tag" style={{ background: '#f1f5f9', color: '#64748b' }}>
            Ans: {draft.correctAnswer}
          </span>
        </div>
        <div className="aw-qrow-actions" onClick={e => e.stopPropagation()}>
          {!editing ? (
            <button className="aw-icon-btn" title="Edit" onClick={() => { setExpanded(true); setEditing(true); }}>
              <Edit2 size={13} />
            </button>
          ) : (
            <button className="aw-icon-btn aw-icon-btn--save" title="Save" disabled={isBusy} onClick={handleSave}>
              <Save size={13} />
            </button>
          )}
          <button className="aw-icon-btn aw-icon-btn--ai" title="AI Fix" disabled={isBusy}
            onClick={() => onAiFix(draft)}>
            <Sparkles size={13} />
          </button>
          <button className="aw-icon-btn aw-icon-btn--del" title="Delete" disabled={isBusy}
            onClick={() => onDelete(question._id)}>
            <Trash2 size={13} />
          </button>
          {expanded
            ? <ChevronDown size={14} style={{ color: '#94a3b8' }} />
            : <ChevronRight size={14} style={{ color: '#94a3b8' }} />}
        </div>
      </div>

      {/* ── Expanded body ── */}
      {expanded && (
        <div className="aw-qrow-body">
          {editing ? (
            <div className="aw-edit-grid">
              <label className="aw-edit-full">
                <span className="aw-edit-label">Question Stem</span>
                <textarea
                  value={draft.questionText || ''}
                  onChange={e => set('questionText', e.target.value)}
                  className="aw-edit-textarea"
                  rows={3}
                />
              </label>
              {['A','B','C','D'].map(k => (
                <label key={k} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span className="aw-edit-label">Option {k}</span>
                  <input
                    value={draft.options?.[k]?.text || ''}
                    onChange={e => setOpt(k, e.target.value)}
                    className="aw-edit-input"
                  />
                </label>
              ))}
              <InlineField label="Correct Answer" value={draft.correctAnswer} onChange={v => set('correctAnswer', v)}
                options={['A','B','C','D'].map(k => ({ value: k, label: k }))} />
              <InlineField label="NEET Relevancy" value={draft.trendingFrequency || 'medium'} onChange={v => set('trendingFrequency', v)}
                options={[{value:'high',label:'🔥 High'},{value:'medium',label:'⚡ Medium'},{value:'low',label:'📦 Low'}]} />
              <InlineField label="In Syllabus" value={String(draft.inSyllabus !== false)} onChange={v => set('inSyllabus', v === 'true')}
                options={[{value:'true',label:'✅ Yes'},{value:'false',label:'❌ No'}]} />
              <InlineField label="Weightage (1-10)" value={draft.weightage || 1} type="number" onChange={v => set('weightage', Number(v))} />
              <ChapterSelect subject={draft.subject} value={draft.chapter || ''} onChange={v => set('chapter', v)} />
              <div className="aw-edit-actions">
                <button className="aw-btn aw-btn--primary" disabled={isBusy} onClick={handleSave}>
                  <Save size={13} /> {isBusy ? 'Saving…' : 'Save changes'}
                </button>
                <button className="aw-btn" onClick={() => { setEditing(false); setDraft(question); }}>
                  <X size={13} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="aw-qdetail">
              <p className="aw-qfull" style={{ whiteSpace: 'pre-wrap' }}>{draft.questionText}</p>
              <div className="aw-options-grid">
                {['A','B','C','D'].map(k => (
                  <div key={k} className={`aw-opt ${draft.correctAnswer === k ? 'aw-opt--correct' : ''}`}>
                    <span className="aw-opt-key">{k}</span>
                    <span>{draft.options?.[k]?.text}</span>
                  </div>
                ))}
              </div>
              {draft.explanation?.text && (
                <div className="aw-explanation">
                  <strong>Explanation:</strong> {draft.explanation.text}
                </div>
              )}
              <div className="aw-meta-row">
                <span>Chapter: <b>{draft.chapter || '—'}</b></span>
                <span>Topic: <b>{draft.topic || '—'}</b></span>
                <span>Source: <b>{draft.source}</b></span>
                {draft.sourceDetails?.year && <span>Year: <b>{draft.sourceDetails.year}</b></span>}
                <span>Quality: <b>{draft.qualityScore ?? 50}/100</b></span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


// ── Draft card (unpublished) ─────────────────────────────────────────────────
const DraftCard = ({ question, index, onSave, onPublish, onDelete, onAiFix, fixingId, savingId }) => {
  const [draft, setDraft] = useState(question);
  const colors = SUBJECT_COLORS[(question.subject || 'biology').toLowerCase()] || SUBJECT_COLORS.biology;
  const isBusy = savingId === question._id || fixingId === question._id;

  // Sync if parent updates (e.g. after AI fix)
  useEffect(() => { setDraft(question); }, [question]);

  const set = (f, v) => setDraft(d => ({ ...d, [f]: v }));
  const setOpt = (k, v) => setDraft(d => ({
    ...d, options: { ...d.options, [k]: { ...(d.options?.[k] || {}), text: v } }
  }));

  const needsReview = (draft.tags || []).includes('needs-answer-review') ||
    (draft.tags || []).includes('needs-option-review');

  return (
    <article className="aw-draft" style={{ borderLeft: `4px solid ${colors.accent}` }}>
      <div className="aw-draft-header" style={{ background: colors.light }}>
        <span className="aw-qnum" style={{ background: colors.accent }}>D{index}</span>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'capitalize', color: colors.badge }}>
          {draft.subject}
        </span>
        {draft.chapter && (
          <span style={{ fontSize: 11, color: '#475569' }}>
            {draft.chapter}{draft.topic ? ` › ${draft.topic}` : ''}
          </span>
        )}
        {needsReview && (
          <span className="aw-badge aw-badge--warn">⚠ Needs Review</span>
        )}
      </div>

      <div className="aw-draft-body">
        <label className="aw-edit-full">
          <span className="aw-edit-label">Question</span>
          <textarea value={draft.questionText || ''} onChange={e => set('questionText', e.target.value)}
            className="aw-edit-textarea" rows={2} />
        </label>

        <div className="aw-options-edit-grid">
          {['A','B','C','D'].map(k => (
            <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 6,
              background: draft.correctAnswer === k ? '#dcfce7' : '#f8fafc',
              border: `1.5px solid ${draft.correctAnswer === k ? '#86efac' : '#e2e8f0'}`,
              borderRadius: 8, padding: '6px 10px' }}>
              <span style={{ width: 22, height: 22, borderRadius: 5, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0,
                background: draft.correctAnswer === k ? '#22c55e' : '#e2e8f0',
                color: draft.correctAnswer === k ? '#fff' : '#64748b' }}>{k}</span>
              <input value={draft.options?.[k]?.text || ''} onChange={e => setOpt(k, e.target.value)}
                style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, outline: 'none' }}
                placeholder={`Option ${k}`} />
            </label>
          ))}
        </div>

        <div className="aw-draft-meta">
          <InlineField label="Correct" value={draft.correctAnswer} onChange={v => set('correctAnswer', v)}
            options={['A','B','C','D'].map(k => ({ value: k, label: k }))} />
          <InlineField label="Relevancy" value={draft.trendingFrequency || 'medium'} onChange={v => set('trendingFrequency', v)}
            options={[{value:'high',label:'🔥 High'},{value:'medium',label:'⚡ Medium'},{value:'low',label:'📦 Low'}]} />
          <InlineField label="In Syllabus" value={String(draft.inSyllabus !== false)} onChange={v => set('inSyllabus', v === 'true')}
            options={[{value:'true',label:'Yes'},{value:'false',label:'No'}]} />
          <ChapterSelect subject={draft.subject} value={draft.chapter || ''} onChange={v => set('chapter', v)} />
        </div>

        <div className="aw-draft-actions">
          <button className="aw-btn" disabled={isBusy} onClick={() => onSave(draft)}>
            <Save size={13} /> Save
          </button>
          <button className="aw-btn aw-btn--ai" disabled={isBusy} onClick={() => onAiFix(draft)}>
            <Sparkles size={13} /> {fixingId === question._id ? 'Fixing…' : 'AI Fix'}
          </button>
          <button className="aw-btn aw-btn--primary" disabled={isBusy} onClick={() => onPublish(draft)}>
            <CheckCircle2 size={13} /> Publish
          </button>
          <button className="aw-btn aw-btn--del" disabled={isBusy} onClick={() => onDelete(question._id)}
            style={{ marginLeft: 'auto' }}>
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>
    </article>
  );
};


// ── Main admin workspace ─────────────────────────────────────────────────────
const AdminQuestionsPage = () => {
  const user = useSelector(s => s.user.user);
  const navigate = useNavigate();

  // ── sidebar tree ──
  const [tree, setTree] = useState({});
  const [expanded, setExpanded] = useState({});
  const [sel, setSel] = useState({ subject: '', chapter: '', topic: '' });

  // ── main panel ──
  const [panel, setPanel] = useState('browser'); // 'browser' | 'import' | 'manual' | 'drafts'
  const [questions, setQuestions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterDiff, setFilterDiff] = useState('');
  const [filterTrend, setFilterTrend] = useState('');
  const [filterSyllabus, setFilterSyllabus] = useState('');

  // ── drafts ──
  const [drafts, setDrafts] = useState([]);
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const [fixingId, setFixingId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [classifying, setClassifying] = useState(false);

  // ── pdf import ──
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfMeta, setPdfMeta] = useState({
    subject: 'biology', chapter: '', topic: '', source: 'pyq',
    year: '', allowLocalOcr: true, useAiParsing: true
  });
  const [processing, setProcessing] = useState(false);

  // ── manual entry ──
  const emptyManual = {
    questionText: '', optionA: '', optionB: '', optionC: '', optionD: '',
    correctAnswer: 'A', explanation: '', subject: 'biology',
    chapter: '', topic: '', difficulty: 'medium', source: 'custom',
    inSyllabus: true, trendingFrequency: 'medium', weightage: 1
  };
  const [manual, setManual] = useState(emptyManual);
  const [creatingManual, setCreatingManual] = useState(false);
  const [pasteText, setPasteText] = useState('');

  // ── stats ──
  const [stats, setStats] = useState(null);

  // ── AI Generate state ──
  const emptyGen = {
    subject: 'biology', chapter: '', topic: '',
    questionTypes: ['mcq'], count: 10,
    includePYQ: true, includePredicted: true,
    difficulty: 'mixed', source: 'custom'
  };
  const [gen, setGen] = useState(emptyGen);
  const [generating, setGenerating] = useState(false);

  const toggleGenType = (t) => setGen(g => ({
    ...g,
    questionTypes: g.questionTypes.includes(t)
      ? g.questionTypes.filter(x => x !== t)
      : [...g.questionTypes, t]
  }));

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!gen.chapter) { toast.error('Select a chapter first.'); return; }
    if (!gen.questionTypes.length) { toast.error('Select at least one question type.'); return; }
    setGenerating(true);
    const tid = toast.loading(`Generating ${gen.count} questions with AI…`);
    try {
      const res = await questionsAPI.generateQuestions(gen);
      setDrafts(cur => [...(res.data || []), ...cur]);
      toast.success(res.message || `${res.data?.length || 0} questions generated!`, { id: tid, duration: 6000 });
      setPanel('drafts');
    } catch (err) {
      toast.error(err.message || 'Generation failed.', { id: tid, duration: 8000 });
    } finally {
      setGenerating(false);
    }
  };

  // ── redirect non-admins ──
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard', { replace: true });
      toast.error('Admin access required.');
    }
  }, [user, navigate]);

  // ── load metadata tree ──
  const loadTree = useCallback(async () => {
    try {
      const res = await questionsAPI.getMetadata();
      const raw = res?.data || [];
      const built = {};
      raw.forEach(row => {
        const { subject, chapter, topic } = row._id;
        if (!subject) return;
        const s = subject.toLowerCase();
        if (!built[s]) built[s] = {};
        const c = chapter || 'General';
        if (!built[s][c]) built[s][c] = new Set();
        if (topic) built[s][c].add(topic);
      });
      Object.keys(built).forEach(s =>
        Object.keys(built[s]).forEach(c => {
          built[s][c] = Array.from(built[s][c]).sort();
        })
      );
      setTree(built);
    } catch (_) {}
  }, []);

  // ── load stats ──
  const loadStats = useCallback(async () => {
    try {
      const res = await questionsAPI.getStats();
      setStats(res?.data || null);
    } catch (_) {}
  }, []);

  // ── load questions ──
  const loadQuestions = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const res = await questionsAPI.getAdminQuestions({
        status: 'published', page: pg, limit: 20,
        subject: sel.subject || undefined,
        chapter: sel.chapter || undefined,
        topic: sel.topic || undefined,
        search: search || undefined,
        difficulty: filterDiff || undefined,
        trendingFrequency: filterTrend || undefined,
        inSyllabus: filterSyllabus !== '' ? filterSyllabus : undefined,
      });
      setQuestions(res?.data || []);
      setPage(res?.pagination?.page || 1);
      setTotalPages(res?.pagination?.pages || 1);
      setTotalCount(res?.pagination?.total || 0);
    } catch (err) {
      toast.error(err.message || 'Could not load questions.');
    } finally {
      setLoading(false);
    }
  }, [sel, search, filterDiff, filterTrend, filterSyllabus]);

  // ── load drafts ──
  const loadDrafts = useCallback(async () => {
    setLoadingDrafts(true);
    try {
      const res = await questionsAPI.getAdminQuestions({ status: 'pending', limit: 100 });
      setDrafts(res?.data || []);
    } catch (err) {
      toast.error(err.message || 'Could not load drafts.');
    } finally {
      setLoadingDrafts(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadTree();
      loadStats();
      loadDrafts();
      loadQuestions(1);
    }
  }, [user, loadTree, loadStats, loadDrafts, loadQuestions]);

  // Re-load when selection / filters change
  useEffect(() => { loadQuestions(1); }, [sel, filterDiff, filterTrend, filterSyllabus, loadQuestions]);

  const handleSearch = e => {
    if (e.key === 'Enter') loadQuestions(1);
  };


  // ── actions ──────────────────────────────────────────────────────────────
  const handleSave = async (q) => {
    setSavingId(q._id);
    try {
      await questionsAPI.updateQuestion(q._id, {
        questionText: q.questionText, options: q.options, correctAnswer: q.correctAnswer,
        explanation: q.explanation, subject: q.subject, chapter: q.chapter,
        topic: q.topic, difficulty: q.difficulty, source: q.source,
        inSyllabus: q.inSyllabus, trendingFrequency: q.trendingFrequency,
        weightage: q.weightage, tags: q.tags,
      });
      setQuestions(cur => cur.map(item => item._id === q._id ? { ...item, ...q } : item));
      setDrafts(cur => cur.map(item => item._id === q._id ? { ...item, ...q } : item));
      toast.success('Saved.');
    } catch (err) { toast.error(err.message || 'Save failed.'); }
    finally { setSavingId(null); }
  };

  const handlePublish = async (q) => {
    setSavingId(q._id);
    try {
      await questionsAPI.updateQuestion(q._id, {
        questionText: q.questionText, options: q.options, correctAnswer: q.correctAnswer,
        explanation: q.explanation, subject: q.subject, chapter: q.chapter,
        topic: q.topic, difficulty: q.difficulty, source: q.source,
        inSyllabus: q.inSyllabus, trendingFrequency: q.trendingFrequency,
        weightage: q.weightage,
      });
      await questionsAPI.publishQuestion(q._id);
      setDrafts(cur => cur.filter(item => item._id !== q._id));
      toast.success('Published!');
      loadTree();
      loadStats();
      loadQuestions(page);
    } catch (err) { toast.error(err.message || 'Publish failed.'); }
    finally { setSavingId(null); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this question?')) return;
    setSavingId(id);
    try {
      await questionsAPI.deleteQuestion(id);
      setQuestions(cur => cur.filter(item => item._id !== id));
      setDrafts(cur => cur.filter(item => item._id !== id));
      toast.success('Deleted.');
      loadTree();
      loadStats();
    } catch (err) { toast.error(err.message || 'Delete failed.'); }
    finally { setSavingId(null); }
  };

  const handleAiFix = async (q) => {
    setFixingId(q._id);
    const tid = toast.loading('AI fixing question…');
    try {
      const res = await questionsAPI.aiFixQuestion(q._id);
      setDrafts(cur => cur.map(item => item._id === q._id ? { ...item, ...res.data } : item));
      setQuestions(cur => cur.map(item => item._id === q._id ? { ...item, ...res.data } : item));
      toast.success('Fixed! Review and save.', { id: tid });
    } catch (err) { toast.error(err.message || 'AI fix failed.', { id: tid }); }
    finally { setFixingId(null); }
  };

  const handleAiClassify = async () => {
    if (!drafts.length) { toast.error('No drafts to classify.'); return; }
    setClassifying(true);
    const ids = drafts.map(q => q._id);
    const chunkSize = 10;
    const tid = toast.loading(`Starting classification (0/${ids.length})...`);
    try {
      for (let i = 0; i < ids.length; i += chunkSize) {
        const chunk = ids.slice(i, i + chunkSize);
        toast.loading(`Classifying questions ${i + 1} to ${Math.min(i + chunkSize, ids.length)} of ${ids.length}...`, { id: tid });
        await questionsAPI.classifyQuestions({ questionIds: chunk, onlyUnclassified: false });
      }
      toast.success(`Successfully classified all ${ids.length} questions!`, { id: tid });
      loadDrafts();
    } catch (err) {
      toast.error(err.message || 'AI Classification failed midway.', { id: tid });
      loadDrafts();
    } finally {
      setClassifying(false);
    }
  };

  const handleAiClassifyAndPublish = async () => {
    if (!drafts.length) { toast.error('No drafts to classify.'); return; }
    if (!window.confirm(`Run AI classification and immediately publish all ${drafts.length} questions?`)) return;
    setClassifying(true);
    const ids = drafts.map(q => q._id);
    const chunkSize = 10;
    const tid = toast.loading(`Starting AI Classify & Publish (0/${ids.length})...`);
    try {
      for (let i = 0; i < ids.length; i += chunkSize) {
        const chunk = ids.slice(i, i + chunkSize);
        toast.loading(`Classifying and publishing ${i + 1} to ${Math.min(i + chunkSize, ids.length)} of ${ids.length}...`, { id: tid });
        await questionsAPI.classifyQuestions({
          questionIds: chunk,
          onlyUnclassified: false,
          publish: true
        });
        // Remove processed drafts dynamically in UI
        setDrafts(cur => cur.filter(q => !chunk.includes(q._id)));
      }
      toast.success(`Successfully classified and published all ${ids.length} questions!`, { id: tid });
      loadTree();
      loadStats();
      loadQuestions(1);
    } catch (err) {
      toast.error(err.message || 'AI Classify & Publish failed midway.', { id: tid });
      loadDrafts();
    } finally {
      setClassifying(false);
    }
  };


  const handlePublishAll = async () => {
    if (!drafts.length) return;
    if (!window.confirm(`Publish all ${drafts.length} drafts?`)) return;
    const tid = toast.loading('Publishing all…');
    let ok = 0;
    for (const q of drafts) {
      try {
        await questionsAPI.updateQuestion(q._id, { questionText: q.questionText, options: q.options, correctAnswer: q.correctAnswer, subject: q.subject, chapter: q.chapter, topic: q.topic, difficulty: q.difficulty, source: q.source });
        await questionsAPI.publishQuestion(q._id);
        ok++;
      } catch (_) {}
    }
    setDrafts([]);
    toast.success(`${ok} questions published!`, { id: tid });
    loadTree(); loadStats(); loadQuestions(1);
  };

  const handleClearAll = async () => {
    const confirmed = window.confirm(
      '⚠️ DELETE ALL QUESTIONS from the database?\n\nThis will permanently remove every question and all test attempts. Type OK to confirm.'
    );
    if (!confirmed) return;
    const tid = toast.loading('Clearing database…');
    try {
      const res = await questionsAPI.clearAllQuestions();
      toast.success(res.message || 'All questions deleted.', { id: tid });
      setQuestions([]); setDrafts([]);
      setTree({}); setStats(null);
      loadStats();
    } catch (err) { toast.error(err.message || 'Clear failed.', { id: tid }); }
  };


  // ── PDF upload ───────────────────────────────────────────────────────────
  const handlePdfUpload = async (e) => {
    e.preventDefault();
    if (!pdfFile || !pdfMeta.chapter) { toast.error('Choose a PDF and a chapter option.'); return; }
    const body = new FormData();
    body.append('pdf', pdfFile);
    Object.entries(pdfMeta).forEach(([k, v]) => {
      let val = v;
      if (k === 'chapter' && v === 'ai-segregated') val = '';
      if (val !== '' && val !== null && val !== undefined) body.append(k, val);
    });
    setProcessing(true);
    const tid = toast.loading('Extracting questions…');
    try {
      const res = await questionsAPI.uploadPDF(body);
      setDrafts(cur => [...(res.data || []), ...cur]);
      toast.success(`${res.data?.length || 0} questions extracted — review in Drafts.`, { id: tid });
      setPdfFile(null);
      setPanel('drafts');
    } catch (err) {
      toast.error(err.action || err.message || 'PDF upload failed.', { id: tid, duration: 8000 });
    } finally { setProcessing(false); }
  };

  // ── Manual create ────────────────────────────────────────────────────────
  const handlePasteParse = () => {
    if (!pasteText.trim()) { toast.error('Paste some MCQ text first.'); return; }
    const ansMatch = pasteText.match(/(?:correct\s*option|ans(?:wer)?)\s*[:.-]?\s*[([]?\s*([A-D])\s*[)\]]?/i);
    const correctAnswer = ansMatch ? ansMatch[1].toUpperCase() : 'A';
    const patterns = [/(?:^|[^A-Z0-9])\(\s*([A-D])\s*\)\s+/gi, /(?:^|[^A-Z0-9])\b([A-D])\s*[.:-]\s+/gi];
    let matches = [];
    for (const pat of patterns) {
      const cur = [...pasteText.matchAll(pat)]
        .map(m => ({ key: m[1].toUpperCase(), index: m.index, len: m[0].length }))
        .filter((m, i, self) => ['A','B','C','D'].includes(m.key) && self.findIndex(x => x.key === m.key) === i)
        .sort((a,b) => a.index - b.index);
      if (cur.length === 4) { matches = cur; break; }
      if (cur.length > matches.length) matches = cur;
    }
    if (matches.length > 0) {
      const stem = pasteText.slice(0, matches[0].index).trim();
      const opts = { A: '', B: '', C: '', D: '' };
      matches.forEach((m, i) => {
        const end = matches[i+1] ? matches[i+1].index : pasteText.length;
        opts[m.key] = pasteText.slice(m.index + m.len, end).replace(/(?:ans(?:wer)?|correct)\s*[:.-]?\s*[([]?\s*[A-D]\s*[)\]]?/gi, '').trim();
      });
      setManual(c => ({ ...c, questionText: stem, optionA: opts.A, optionB: opts.B, optionC: opts.C, optionD: opts.D, correctAnswer }));
      setPasteText('');
      toast.success('Parsed! Fill remaining fields and submit.');
    } else {
      setManual(c => ({ ...c, questionText: pasteText.trim() }));
      toast.error('Could not find 4 options — question text populated.');
    }
  };

  const handleManualCreate = async (e) => {
    e.preventDefault();
    if (!manual.questionText.trim() || !manual.optionA.trim() || !manual.chapter.trim()) {
      toast.error('Question, all 4 options, and chapter are required.');
      return;
    }
    setCreatingManual(true);
    try {
      const res = await questionsAPI.createQuestion({
        questionText: manual.questionText.trim(),
        options: { A: { text: manual.optionA.trim() }, B: { text: manual.optionB.trim() },
                   C: { text: manual.optionC.trim() }, D: { text: manual.optionD.trim() } },
        correctAnswer: manual.correctAnswer,
        explanation: manual.explanation ? { text: manual.explanation } : undefined,
        subject: manual.subject, chapter: manual.chapter.trim(), topic: manual.topic.trim(),
        difficulty: manual.difficulty, source: manual.source,
        inSyllabus: manual.inSyllabus, trendingFrequency: manual.trendingFrequency,
        weightage: Number(manual.weightage),
      });
      setDrafts(cur => [res.data, ...cur]);
      setManual(emptyManual);
      toast.success('Draft created — go to Drafts to publish.');
      setPanel('drafts');
    } catch (err) { toast.error(err.message || 'Create failed.'); }
    finally { setCreatingManual(false); }
  };

  if (!user || user.role !== 'admin') return null;


  // ── render ───────────────────────────────────────────────────────────────
  return (
    <div className="aw-root">
      {/* ── Top bar ── */}
      <header className="aw-topbar">
        <div className="aw-topbar-brand">
          <ShieldCheck size={18} />
          <span>Admin Workspace</span>
        </div>
        <nav className="aw-topbar-nav">
          {[
            { id: 'browser',  icon: <Database size={14} />,  label: 'Question Browser' },
            { id: 'drafts',   icon: <File size={14} />,      label: `Drafts ${drafts.length ? `(${drafts.length})` : ''}` },
            { id: 'generate', icon: <Sparkles size={14} />,  label: 'AI Generate' },
            { id: 'import',   icon: <FileUp size={14} />,    label: 'PDF Import' },
            { id: 'manual',   icon: <Edit2 size={14} />,     label: 'Manual Entry' },
          ].map(tab => (
            <button key={tab.id} className={`aw-tab ${panel === tab.id ? 'aw-tab--active' : ''}`}
              onClick={() => setPanel(tab.id)}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
        <div className="aw-topbar-actions">
          <button className="aw-btn aw-btn--ghost" onClick={() => { loadTree(); loadStats(); loadDrafts(); loadQuestions(1); }}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button className="aw-btn aw-btn--danger" onClick={handleClearAll}>
            <AlertTriangle size={13} /> Clear DB
          </button>
        </div>
      </header>

      {/* ── Stat bar ── */}
      {stats && (
        <div className="aw-statbar">
          <span className="aw-stat"><BarChart2 size={13} /> Total published: <b>{stats.totalPublished || 0}</b></span>
          <span className="aw-stat"><File size={13} /> Pending drafts: <b>{stats.totalPending || 0}</b></span>
          {(stats.bySubject || []).map(s => (
            <span key={s._id} className="aw-stat" style={{ textTransform: 'capitalize' }}>
              {s._id}: <b>{s.count}</b>
            </span>
          ))}
        </div>
      )}

      <div className="aw-body">
        {/* ════════════════════════════════════════════════════════════════
            PANEL: QUESTION BROWSER
        ════════════════════════════════════════════════════════════════ */}
        {panel === 'browser' && (
          <div className="aw-browser">
            {/* ── Left sidebar: file tree ── */}
            <aside className="aw-sidebar">
              <div className="aw-sidebar-title">
                <Folder size={14} /> Directory
              </div>

              {/* All root */}
              <div
                className={`aw-tree-item aw-tree-subject ${!sel.subject ? 'aw-tree-item--active' : ''}`}
                onClick={() => setSel({ subject: '', chapter: '', topic: '' })}
              >
                <Database size={13} /> <span>All Questions</span>
                <span className="aw-tree-count">{stats?.totalPublished || 0}</span>
              </div>

              {Object.keys(SYLLABUS).map(subjectLabel => {
                const subKey = subjectLabel.toLowerCase();
                const isOpen = !!expanded[subKey];
                const chapters = Object.keys(tree[subKey] || {}).sort();
                const isActiveSub = sel.subject === subKey && !sel.chapter;

                return (
                  <div key={subjectLabel} className="aw-tree-group">
                    <div
                      className={`aw-tree-item aw-tree-subject ${isActiveSub ? 'aw-tree-item--active' : ''}`}
                      onClick={() => {
                        setExpanded(c => ({ ...c, [subKey]: !c[subKey] }));
                        setSel({ subject: subKey, chapter: '', topic: '' });
                      }}
                    >
                      {isOpen ? <FolderOpen size={14} style={{ color: '#f59e0b' }} /> : <Folder size={14} style={{ color: '#f59e0b' }} />}
                      <span>{subjectLabel}</span>
                      <span className="aw-tree-count">{chapters.length} ch</span>
                    </div>

                    {isOpen && (
                      <div className="aw-tree-children">
                        {/* NEET syllabus: Class 11 / Class 12 → Unit → Chapter */}
                        {Object.entries(SYLLABUS[subjectLabel] || {}).map(([classLabel, units]) => {
                          const classKey = `${subKey}/${classLabel}`;
                          const isClassOpen = !!expanded[classKey];

                          return (
                            <div key={classLabel} className="aw-tree-group">
                              {/* Class label */}
                              <div
                                className="aw-tree-item aw-tree-class"
                                onClick={() => setExpanded(c => ({ ...c, [classKey]: !c[classKey] }))}
                              >
                                {isClassOpen
                                  ? <ChevronDown size={12} style={{ color: '#f59e0b' }} />
                                  : <ChevronRight size={12} style={{ color: '#f59e0b' }} />}
                                <span style={{ fontWeight: 700, color: '#fbbf24' }}>{classLabel}</span>
                              </div>

                              {isClassOpen && (
                                <div className="aw-tree-children">
                                  {Object.entries(units).map(([unitLabel, chapters]) => {
                                    if (!chapters.length) return null;
                                    const unitKey = `${subKey}/${classLabel}/${unitLabel}`;
                                    const isUnitOpen = !!expanded[unitKey];

                                    return (
                                      <div key={unitLabel} className="aw-tree-group">
                                        {/* Unit label */}
                                        <div
                                          className="aw-tree-item aw-tree-unit"
                                          onClick={() => setExpanded(c => ({ ...c, [unitKey]: !c[unitKey] }))}
                                        >
                                          {isUnitOpen
                                            ? <ChevronDown size={11} style={{ color: '#6b7280' }} />
                                            : <ChevronRight size={11} style={{ color: '#6b7280' }} />}
                                          <span className="aw-tree-label" style={{ fontSize: 11, color: '#94a3b8' }}>{unitLabel}</span>
                                        </div>

                                        {isUnitOpen && (
                                          <div className="aw-tree-children">
                                            {chapters.map(chapName => {
                                              const chapKey = `${subKey}/${chapName}`;
                                              const isChapOpen = !!expanded[chapKey];
                                              const topics = tree[subKey]?.[chapName] || [];
                                              const isActiveChap = sel.subject === subKey && sel.chapter === chapName && !sel.topic;
                                              const hasData = !!tree[subKey]?.[chapName];

                                              return (
                                                <div key={chapName} className="aw-tree-group">
                                                  <div
                                                    className={`aw-tree-item aw-tree-chapter ${isActiveChap ? 'aw-tree-item--active' : ''} ${!hasData ? 'aw-tree-item--empty' : ''}`}
                                                    onClick={() => {
                                                      setExpanded(c => ({ ...c, [chapKey]: !c[chapKey] }));
                                                      setSel({ subject: subKey, chapter: chapName, topic: '' });
                                                    }}
                                                  >
                                                    {topics.length > 0
                                                      ? (isChapOpen ? <FolderOpen size={12} style={{ color: '#a3a3a3' }} /> : <Folder size={12} style={{ color: '#a3a3a3' }} />)
                                                      : <File size={12} style={{ color: '#d4d4d4' }} />}
                                                    <span className="aw-tree-label">{chapName}</span>
                                                    {hasData && <span className="aw-tree-dot" />}
                                                  </div>

                                                  {isChapOpen && topics.length > 0 && (
                                                    <div className="aw-tree-children">
                                                      {topics.map(topicName => (
                                                        <div
                                                          key={topicName}
                                                          className={`aw-tree-item aw-tree-topic ${sel.subject === subKey && sel.chapter === chapName && sel.topic === topicName ? 'aw-tree-item--active' : ''}`}
                                                          onClick={() => setSel({ subject: subKey, chapter: chapName, topic: topicName })}
                                                        >
                                                          <File size={11} /> <span className="aw-tree-label">{topicName}</span>
                                                        </div>
                                                      ))}
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </aside>


            {/* ── Right: question list ── */}
            <main className="aw-main">
              {/* breadcrumb + search bar */}
              <div className="aw-main-toolbar">
                <div className="aw-breadcrumb">
                  <span onClick={() => setSel({ subject: '', chapter: '', topic: '' })} className="aw-bc-link">All</span>
                  {sel.subject && (<><span className="aw-bc-sep">›</span><span onClick={() => setSel(s => ({ ...s, chapter: '', topic: '' }))} className="aw-bc-link" style={{ textTransform: 'capitalize' }}>{sel.subject}</span></>)}
                  {sel.chapter && (<><span className="aw-bc-sep">›</span><span onClick={() => setSel(s => ({ ...s, topic: '' }))} className="aw-bc-link">{sel.chapter}</span></>)}
                  {sel.topic && (<><span className="aw-bc-sep">›</span><span className="aw-bc-current">{sel.topic}</span></>)}
                </div>
                <div className="aw-toolbar-right">
                  <div className="aw-search">
                    <Search size={13} />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      onKeyDown={handleSearch}
                      placeholder="Search questions… (Enter)"
                    />
                    {search && <button onClick={() => { setSearch(''); loadQuestions(1); }}><X size={12} /></button>}
                  </div>
                  <select className="aw-filter" value={filterDiff} onChange={e => setFilterDiff(e.target.value)}>
                    <option value="">All difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                  <select className="aw-filter" value={filterTrend} onChange={e => setFilterTrend(e.target.value)}>
                    <option value="">All relevancy</option>
                    <option value="high">🔥 High</option>
                    <option value="medium">⚡ Medium</option>
                    <option value="low">📦 Low</option>
                  </select>
                  <select className="aw-filter" value={filterSyllabus} onChange={e => setFilterSyllabus(e.target.value)}>
                    <option value="">All syllabus</option>
                    <option value="true">In syllabus</option>
                    <option value="false">Out of syllabus</option>
                  </select>
                </div>
              </div>

              <div className="aw-result-count">
                {totalCount} question{totalCount !== 1 ? 's' : ''} found
                {sel.subject && ` in ${sel.subject}`}
                {sel.chapter && ` › ${sel.chapter}`}
                {sel.topic && ` › ${sel.topic}`}
              </div>

              {loading ? (
                <div className="aw-loading"><div className="aw-spinner" /><span>Loading…</span></div>
              ) : questions.length === 0 ? (
                <div className="aw-empty">
                  <Folder size={40} />
                  <h3>No questions here</h3>
                  <p>Upload a PDF or add questions manually to populate this folder.</p>
                </div>
              ) : (
                <div className="aw-qlist">
                  {questions.map((q, i) => (
                    <QuestionRow
                      key={q._id}
                      question={q}
                      index={i + 1 + (page - 1) * 20}
                      onDelete={handleDelete}
                      onSave={handleSave}
                      onAiFix={handleAiFix}
                      fixingId={fixingId}
                      savingId={savingId}
                    />
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="aw-pagination">
                  <button disabled={page <= 1} onClick={() => loadQuestions(page - 1)} className="aw-btn">← Prev</button>
                  <span>Page {page} of {totalPages}</span>
                  <button disabled={page >= totalPages} onClick={() => loadQuestions(page + 1)} className="aw-btn">Next →</button>
                </div>
              )}
            </main>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            PANEL: DRAFTS
        ════════════════════════════════════════════════════════════════ */}
        {panel === 'drafts' && (
          <div className="aw-panel">
            <div className="aw-panel-header">
              <div>
                <h2 className="aw-panel-title">
                  <File size={18} /> Review Queue
                </h2>
                <p className="aw-panel-sub">{drafts.length} unpublished draft{drafts.length !== 1 ? 's' : ''} waiting for review</p>
              </div>
              {drafts.length > 0 && (
                <div className="aw-panel-actions" style={{ display: 'flex', gap: '8px' }}>
                  <button className="aw-btn aw-btn--ghost" disabled={classifying} onClick={handleAiClassify}>
                    <Brain size={13} /> {classifying ? 'Classifying…' : 'AI Classify All'}
                  </button>
                  <button className="aw-btn aw-btn--primary" style={{ background: 'linear-gradient(135deg, #805ad5, #6b46c1)' }} disabled={classifying} onClick={handleAiClassifyAndPublish}>
                    <Sparkles size={13} /> {classifying ? 'Publishing…' : 'AI Classify & Publish All'}
                  </button>
                  <button className="aw-btn aw-btn--ghost" onClick={handlePublishAll}>
                    <Zap size={13} /> Publish All {drafts.length}
                  </button>
                </div>
              )}
            </div>

            {loadingDrafts ? (
              <div className="aw-loading"><div className="aw-spinner" /><span>Loading drafts…</span></div>
            ) : drafts.length === 0 ? (
              <div className="aw-empty">
                <CheckCircle2 size={40} style={{ color: '#22c55e' }} />
                <h3>Review queue is clear</h3>
                <p>Import a PDF or add a manual question to create drafts.</p>
              </div>
            ) : (
              <div className="aw-draft-list">
                {drafts.map((q, i) => (
                  <DraftCard
                    key={q._id}
                    question={q}
                    index={i + 1}
                    onSave={handleSave}
                    onPublish={handlePublish}
                    onDelete={handleDelete}
                    onAiFix={handleAiFix}
                    fixingId={fixingId}
                    savingId={savingId}
                  />
                ))}
              </div>
            )}
          </div>
        )}


        {/* ════════════════════════════════════════════════════════════════
            PANEL: PDF IMPORT
        ════════════════════════════════════════════════════════════════ */}
        {panel === 'import' && (
          <div className="aw-panel">
            <div className="aw-panel-header">
              <div>
                <h2 className="aw-panel-title"><FileUp size={18} /> PDF Import</h2>
                <p className="aw-panel-sub">Upload any NEET question paper PDF — questions are extracted into drafts.</p>
              </div>
            </div>
            <form className="aw-form" onSubmit={handlePdfUpload}>
              <label className="aw-file-drop">
                <FileText size={28} />
                <span>{pdfFile ? pdfFile.name : 'Click or drag a PDF (up to 100 MB)'}</span>
                <input type="file" accept="application/pdf" onChange={e => setPdfFile(e.target.files[0] || null)} />
              </label>

              <div className="aw-form-grid">
                <InlineField label="Subject" value={pdfMeta.subject} onChange={v => setPdfMeta(m => ({ ...m, subject: v, chapter: '' }))}
                  options={['physics','chemistry','biology','botany','zoology'].map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))} />
                <ChapterSelect subject={pdfMeta.subject} value={pdfMeta.chapter} onChange={v => setPdfMeta(m => ({ ...m, chapter: v }))} allowAiSegregated={true} />
                <InlineField label="Source" value={pdfMeta.source} onChange={v => setPdfMeta(m => ({ ...m, source: v }))}
                  options={[{value:'pyq',label:'Previous Year'},{value:'mock',label:'Mock Test'},{value:'dpp',label:'DPP'},{value:'ncert',label:'NCERT'},{value:'custom',label:'Custom'}]} />
                {pdfMeta.source === 'pyq' && (
                  <InlineField label="Year" value={pdfMeta.year} type="number" onChange={v => setPdfMeta(m => ({ ...m, year: v }))} />
                )}
              </div>

              <div className="aw-form-checks">
                <label className="aw-check-row">
                  <input type="checkbox" checked={pdfMeta.allowLocalOcr} onChange={e => setPdfMeta(m => ({ ...m, allowLocalOcr: e.target.checked }))} />
                  <span><strong>Run local OCR</strong> for scanned PDFs (requires Poppler)</span>
                </label>
                <label className="aw-check-row">
                  <input type="checkbox" checked={pdfMeta.useAiParsing} onChange={e => setPdfMeta(m => ({ ...m, useAiParsing: e.target.checked }))} />
                  <span><strong>Use AI parsing</strong> (Bedrock) for complex layouts — costs tokens</span>
                </label>
              </div>

              <button type="submit" className="aw-btn aw-btn--primary aw-btn--lg" disabled={processing}>
                <FileUp size={14} /> {processing ? 'Extracting…' : 'Process PDF & Create Drafts'}
              </button>
            </form>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            PANEL: AI GENERATE
        ════════════════════════════════════════════════════════════════ */}
        {panel === 'generate' && (
          <div className="aw-panel">
            <div className="aw-panel-header">
              <div>
                <h2 className="aw-panel-title"><Sparkles size={18} /> AI Question Generator</h2>
                <p className="aw-panel-sub">
                  AI generates NEET-standard questions — MCQ, Assertion-Reason, Match the Following, Statement-based —
                  with PYQ-style and predicted questions. Saved as drafts for your review.
                </p>
              </div>
            </div>

            <form className="aw-form" onSubmit={handleGenerate}>

              {/* ── Subject + Chapter ── */}
              <div className="aw-form-grid">
                <InlineField label="Subject" value={gen.subject}
                  onChange={v => setGen(g => ({ ...g, subject: v, chapter: '' }))}
                  options={['physics','chemistry','biology','botany','zoology'].map(s => ({
                    value: s, label: s.charAt(0).toUpperCase() + s.slice(1)
                  }))} />
                <ChapterSelect subject={gen.subject} value={gen.chapter}
                  onChange={v => setGen(g => ({ ...g, chapter: v }))} />
                <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span className="aw-edit-label">Topic (optional — AI picks if blank)</span>
                  <input value={gen.topic} onChange={e => setGen(g => ({ ...g, topic: e.target.value }))}
                    className="aw-edit-input" placeholder="e.g. Ecosystem, Krebs Cycle…" />
                </label>
                <InlineField label="Difficulty" value={gen.difficulty}
                  onChange={v => setGen(g => ({ ...g, difficulty: v }))}
                  options={[
                    {value:'mixed',  label:'Mixed (30% easy, 40% medium, 30% hard)'},
                    {value:'easy',   label:'Easy — Direct recall / NCERT'},
                    {value:'medium', label:'Medium — Application'},
                    {value:'hard',   label:'Hard — Multi-concept / Analysis'},
                  ]} />
                <InlineField label="Questions per type" value={gen.count} type="number"
                  onChange={v => setGen(g => ({ ...g, count: Math.min(20, Math.max(1, Number(v))) }))} />
                <InlineField label="Source tag" value={gen.source}
                  onChange={v => setGen(g => ({ ...g, source: v }))}
                  options={[{value:'custom',label:'AI Generated'},{value:'pyq',label:'PYQ Style'},{value:'mock',label:'Mock Test'}]} />
              </div>

              {/* ── Question types ── */}
              <div>
                <span className="aw-edit-label" style={{ display: 'block', marginBottom: 8 }}>
                  Question Types (select all you want)
                </span>
                <div className="aw-type-grid">
                  {[
                    { id: 'mcq',             icon: '🔘', label: 'MCQ',             sub: 'Standard 4-option multiple choice' },
                    { id: 'assertion_reason', icon: '⚖️', label: 'Assertion-Reason', sub: 'A&R with standard 4 options' },
                    { id: 'match_following',  icon: '🔗', label: 'Match the Following', sub: 'Column I ↔ Column II' },
                    { id: 'statement_based',  icon: '📋', label: 'Statement-Based', sub: 'Multiple true/false statements' },
                  ].map(({ id, icon, label, sub }) => (
                    <div
                      key={id}
                      className={`aw-type-card ${gen.questionTypes.includes(id) ? 'aw-type-card--on' : ''}`}
                      onClick={() => toggleGenType(id)}
                    >
                      <span className="aw-type-icon">{icon}</span>
                      <div>
                        <div className="aw-type-label">{label}</div>
                        <div className="aw-type-sub">{sub}</div>
                      </div>
                      <span className="aw-type-check">{gen.questionTypes.includes(id) ? '✓' : ''}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── PYQ + Predicted toggles ── */}
              <div className="aw-form-checks">
                <label className="aw-check-row">
                  <input type="checkbox" checked={gen.includePYQ}
                    onChange={e => setGen(g => ({ ...g, includePYQ: e.target.checked }))} />
                  <span>
                    <strong>Include PYQ-style questions</strong>
                    <small style={{ display: 'block', color: '#64748b', marginTop: 2 }}>
                      Questions similar to those asked in NEET 2017–2024. AI marks them with year reference.
                    </small>
                  </span>
                </label>
                <label className="aw-check-row">
                  <input type="checkbox" checked={gen.includePredicted}
                    onChange={e => setGen(g => ({ ...g, includePredicted: e.target.checked }))} />
                  <span>
                    <strong>Include predicted questions</strong>
                    <small style={{ display: 'block', color: '#64748b', marginTop: 2 }}>
                      Questions likely to appear in upcoming NEET based on NTA trends and syllabus weightage.
                    </small>
                  </span>
                </label>
              </div>

              {/* ── Info box ── */}
              <div className="aw-gen-info">
                <Sparkles size={14} />
                <span>
                  AI will generate <strong>{gen.count} × {gen.questionTypes.length || 1} = {gen.count * (gen.questionTypes.length || 1)} questions</strong> for{' '}
                  <strong>{gen.chapter || 'selected chapter'}</strong>
                  {gen.topic ? ` › ${gen.topic}` : ''}.
                  They'll go into your Drafts queue for review before publishing.
                </span>
              </div>

              <button type="submit" className="aw-btn aw-btn--ai aw-btn--lg" disabled={generating}>
                <Sparkles size={14} />
                {generating ? 'Generating… this may take 15-30s' : `Generate ${gen.count * (gen.questionTypes.length || 1)} Questions`}
              </button>
            </form>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            PANEL: MANUAL ENTRY
        ════════════════════════════════════════════════════════════════ */}
        {panel === 'manual' && (
          <div className="aw-panel">
            <div className="aw-panel-header">
              <div>
                <h2 className="aw-panel-title"><Edit2 size={18} /> Manual Entry</h2>
                <p className="aw-panel-sub">Type or paste a question — saved as a draft for review before publishing.</p>
              </div>
            </div>

            {/* Quick paste */}
            <div className="aw-paste-box">
              <h3 className="aw-paste-title"><Sparkles size={14} /> Quick MCQ Paste</h3>
              <textarea
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
                placeholder={'Paste a raw MCQ here:\nWhich gas has maximum density at STP?\n(A) Hydrogen  (B) Oxygen  (C) Nitrogen  (D) CO₂\nCorrect Answer: B'}
                className="aw-paste-area"
                rows={4}
              />
              <button type="button" className="aw-btn aw-btn--ai" onClick={handlePasteParse}>
                <Sparkles size={13} /> Parse & Auto-fill
              </button>
            </div>

            <form className="aw-form" onSubmit={handleManualCreate}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span className="aw-edit-label">Question Text *</span>
                <textarea value={manual.questionText} onChange={e => setManual(m => ({ ...m, questionText: e.target.value }))}
                  className="aw-edit-textarea" rows={3} placeholder="Full question stem" />
              </label>

              <div className="aw-form-grid">
                {['A','B','C','D'].map(k => (
                  <label key={k} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span className="aw-edit-label">Option {k} *</span>
                    <input value={manual[`option${k}`]} onChange={e => setManual(m => ({ ...m, [`option${k}`]: e.target.value }))}
                      className="aw-edit-input" placeholder={`Option ${k}`} />
                  </label>
                ))}
                <InlineField label="Correct Answer" value={manual.correctAnswer} onChange={v => setManual(m => ({ ...m, correctAnswer: v }))}
                  options={['A','B','C','D'].map(k => ({ value: k, label: k }))} />
                <InlineField label="Subject" value={manual.subject} onChange={v => setManual(m => ({ ...m, subject: v, chapter: '' }))}
                  options={['physics','chemistry','biology','botany','zoology'].map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))} />
                <ChapterSelect subject={manual.subject} value={manual.chapter} onChange={v => setManual(m => ({ ...m, chapter: v }))} />
                <InlineField label="NEET Relevancy" value={manual.trendingFrequency} onChange={v => setManual(m => ({ ...m, trendingFrequency: v }))}
                  options={[{value:'high',label:'🔥 High'},{value:'medium',label:'⚡ Medium'},{value:'low',label:'📦 Low'}]} />
                <InlineField label="In Syllabus" value={String(manual.inSyllabus)} onChange={v => setManual(m => ({ ...m, inSyllabus: v === 'true' }))}
                  options={[{value:'true',label:'Yes'},{value:'false',label:'No'}]} />
                <InlineField label="Source" value={manual.source} onChange={v => setManual(m => ({ ...m, source: v }))}
                  options={[{value:'custom',label:'Custom'},{value:'pyq',label:'PYQ'},{value:'mock',label:'Mock'},{value:'dpp',label:'DPP'},{value:'ncert',label:'NCERT'}]} />
                <InlineField label="Weightage (1-10)" value={manual.weightage} type="number" onChange={v => setManual(m => ({ ...m, weightage: Number(v) }))} />
              </div>

              <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span className="aw-edit-label">Explanation (optional)</span>
                <textarea value={manual.explanation} onChange={e => setManual(m => ({ ...m, explanation: e.target.value }))}
                  className="aw-edit-textarea" rows={2} placeholder="Explanation of why the correct answer is right" />
              </label>

              <button type="submit" className="aw-btn aw-btn--primary aw-btn--lg" disabled={creatingManual}>
                <Save size={14} /> {creatingManual ? 'Saving…' : 'Save as Draft'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminQuestionsPage;
