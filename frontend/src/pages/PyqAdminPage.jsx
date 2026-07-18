import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, FileJson, Flag, Loader2, RefreshCw, ShieldCheck, Upload, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import AppShell from '../components/AppShell';
import { pyqAPI } from '../services/api';

const example = [{
  questionText: 'Original or legally supplied question text',
  subject: 'physics', chapter: 'Units and Measurements', topic: 'Dimensional analysis', subtopic: 'Dimensions', year: 2025, examName: 'NEET',
  options: { A: 'Option A', B: 'Option B', C: 'Option C', D: 'Option D' }, correctAnswer: 'A', difficulty: 'medium', type: 'mcq',
  detailedSolution: 'Explain the answer step by step.', shortSolution: 'Concise method.', fastestMethod: 'Fastest valid approach.', formulaConcept: '[M L T^-2]',
  optionExplanations: { A: 'Why correct', B: 'Why incorrect', C: 'Why incorrect', D: 'Why incorrect' }, legalStatus: 'user_provided'
}];

const parseCsv = (text) => {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"' && quoted && text[index + 1] === '"') { cell += '"'; index += 1; }
    else if (character === '"') quoted = !quoted;
    else if (character === ',' && !quoted) { row.push(cell.trim()); cell = ''; }
    else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && text[index + 1] === '\n') index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = []; cell = '';
    } else cell += character;
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  const headers = (rows.shift() || []).map((header) => String(header).trim());
  return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])));
};

export default function PyqAdminPage() {
  const [raw, setRaw] = useState(JSON.stringify(example, null, 2));
  const [validation, setValidation] = useState(null);
  const [reports, setReports] = useState([]);
  const [queue, setQueue] = useState([]);
  const [provenance, setProvenance] = useState({});
  const [busy, setBusy] = useState(false);
  const parsed = useMemo(() => { try { return JSON.parse(raw); } catch { return null; } }, [raw]);

  const normalizeRow = (row) => ({
    ...row,
    year: Number(row.year || row.examYear),
    options: row.options || {
      A: row.optionA || row.A,
      B: row.optionB || row.B,
      C: row.optionC || row.C,
      D: row.optionD || row.D
    },
    correctAnswer: String(row.correctAnswer || row.answer || '').toUpperCase(),
    detailedSolution: row.detailedSolution || row.solution || row.explanation,
    legalStatus: row.legalStatus || 'pending'
  });
  const loadFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      let rows;
      if (file.name.toLowerCase().endsWith('.json')) rows = JSON.parse(await file.text());
      else if (file.name.toLowerCase().endsWith('.csv')) rows = parseCsv(await file.text());
      else {
        const readXlsxFile = (await import('read-excel-file/browser')).default;
        const cells = await readXlsxFile(file);
        const headers = (cells.shift() || []).map((header) => String(header || '').trim());
        rows = cells.filter((values) => values.some((value) => value !== null && value !== '')).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])));
      }
      if (!Array.isArray(rows)) throw new Error('The file must contain a table or JSON array');
      setRaw(JSON.stringify(rows.map(normalizeRow), null, 2));
      setValidation(null);
      toast.success(`${rows.length} rows loaded from ${file.name}`);
    } catch (error) { toast.error(error.message || 'Could not read file'); }
    event.target.value = '';
  };

  const loadReports = () => pyqAPI.getReports().then((response) => setReports(response.data)).catch(() => {});
  const loadQueue = () => pyqAPI.getAdminQueue().then((response) => setQueue(response.data)).catch(() => {});
  useEffect(() => { loadReports(); loadQueue(); }, []);
  const validate = async () => {
    if (!Array.isArray(parsed)) return toast.error('Enter a valid JSON array');
    setBusy(true); try { const response = await pyqAPI.validateImport(parsed); setValidation(response.data); toast.success('Validation complete'); } catch (error) { toast.error(error.message || 'Validation failed'); } finally { setBusy(false); }
  };
  const importData = async () => {
    if (!validation || validation.invalid) return toast.error('Resolve all validation errors first');
    setBusy(true); try { const response = await pyqAPI.importQuestions(parsed); toast.success(`${response.data.inserted} questions imported as unpublished`); setValidation(null); loadQueue(); } catch (error) { toast.error(error.message || 'Import failed'); } finally { setBusy(false); }
  };
  const resolve = async (item) => { try { await pyqAPI.resolveReport(item.interactionId, item.report._id, 'resolved'); toast.success('Report resolved'); loadReports(); } catch { toast.error('Could not update report'); } };
  const verifyQuestion = async (question) => { try { await pyqAPI.verifyQuestion(question._id, provenance[question._id] || question.pyqDetails?.legalStatus); toast.success('Expert checks recorded; publication is still blocked'); loadQueue(); } catch (error) { toast.error(error.message || 'Verification failed'); } };
  const publishQuestion = async (question) => { try { await pyqAPI.publishQuestion(question._id); toast.success('Verified PYQ published'); loadQueue(); } catch (error) { toast.error(error.message || 'Publication blocked'); } };

  return <AppShell><div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
    <section className="overflow-hidden rounded-3xl bg-slate-950 p-7 text-white shadow-xl sm:p-9"><span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-indigo-200"><ShieldCheck size={15}/> Expert verification workspace</span><h1 className="mt-4 text-3xl font-black">PYQ import and quality control</h1><p className="mt-3 max-w-3xl leading-6 text-slate-300">Validate structured JSON, detect missing fields and curriculum mismatches, import into a pending queue, and review student-reported errors. Imported questions are never published automatically.</p></section>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="flex items-center gap-2 text-xl font-black"><FileJson className="text-indigo-600"/> CSV, Excel, or JSON import</h2><p className="text-sm text-slate-500">Load a spreadsheet or edit the normalized JSON before server validation.</p></div><div className="flex flex-wrap gap-2"><label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-700"><Upload size={15}/> Choose file<input type="file" accept=".json,.csv,.xlsx" onChange={loadFile} className="hidden"/></label><button onClick={()=>setRaw(JSON.stringify(example,null,2))} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold"><RefreshCw size={15}/> Reset example</button></div></div><textarea spellCheck="false" value={raw} onChange={(event)=>{setRaw(event.target.value);setValidation(null);}} className="mt-5 min-h-[520px] w-full rounded-2xl bg-slate-950 p-5 font-mono text-xs leading-6 text-slate-200 outline-none focus:ring-4 focus:ring-indigo-100"/><div className="mt-4 flex flex-wrap gap-3"><button onClick={validate} disabled={busy||!parsed} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-black text-white disabled:opacity-50">{busy?<Loader2 className="animate-spin" size={17}/>:<ShieldCheck size={17}/>} Validate only</button><button onClick={importData} disabled={busy||!validation||validation.invalid>0} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white disabled:opacity-40"><Upload size={17}/> Import to pending review</button></div></section>
      <div className="space-y-6"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-black">Validation summary</h2>{validation?<><div className="mt-4 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-slate-50 p-3"><b className="block text-xl">{validation.total}</b><small>Total</small></div><div className="rounded-xl bg-emerald-50 p-3 text-emerald-700"><b className="block text-xl">{validation.valid}</b><small>Valid</small></div><div className="rounded-xl bg-rose-50 p-3 text-rose-700"><b className="block text-xl">{validation.invalid}</b><small>Invalid</small></div></div><div className="mt-4 max-h-64 space-y-2 overflow-y-auto">{validation.results.map((item)=><div key={item.index} className={`rounded-xl border p-3 text-xs ${item.valid?'border-emerald-200 bg-emerald-50':'border-rose-200 bg-rose-50'}`}><p className="flex items-center gap-2 font-black">{item.valid?<CheckCircle2 size={15}/>:<XCircle size={15}/>} Record {item.index+1}</p>{item.errors.map((error)=><p className="mt-1" key={error}>{error}</p>)}</div>)}</div></>:<div className="mt-5 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">Run validation to see field-level results.</div>}<p className="mt-4 flex gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800"><AlertTriangle className="shrink-0" size={16}/> Valid imports remain unpublished until an expert verifies the text, answer, explanation, classification, and exam year.</p></section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 font-black"><Flag className="text-rose-500" size={18}/> Open student reports</h2><span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-black text-rose-600">{reports.length}</span></div><div className="mt-4 max-h-[430px] space-y-3 overflow-y-auto">{reports.length?reports.map((item)=><article key={item.report._id} className="rounded-xl border border-slate-200 p-3"><p className="line-clamp-2 text-sm font-bold">{item.question?.questionText}</p><p className="mt-2 text-xs text-slate-500">{item.report.reason}: {item.report.details}</p><button onClick={()=>resolve(item)} className="mt-3 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white">Mark resolved</button></article>):<p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-400">No open reports.</p>}</div></section></div>
    </div>
    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-black">Pending verification queue</h2><p className="text-sm text-slate-500">Verify provenance and required fields first; publication is a separate explicit action.</p></div><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">{queue.length} pending</span></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400"><tr><th className="p-4">Question</th><th className="p-4">Classification</th><th className="p-4">Year</th><th className="p-4">Provenance</th><th className="p-4">Checks</th><th className="p-4">Actions</th></tr></thead><tbody>{queue.map((question)=>{const checks=question.pyqDetails?.verification;const verified=['questionText','answer','explanation','classification','examYear'].every((key)=>checks?.[key]);return <tr key={question._id} className="border-t border-slate-100"><td className="max-w-md p-4"><b className="line-clamp-2">{question.questionText}</b><small className="mt-1 block text-slate-400">{question.questionId}</small></td><td className="p-4"><b>{question.subject}</b><small className="block text-slate-400">{question.chapter} · {question.topic}</small></td><td className="p-4 font-bold">{question.sourceDetails?.year}</td><td className="p-4"><select value={provenance[question._id] || question.pyqDetails?.legalStatus || 'pending'} onChange={(event)=>setProvenance((current)=>({...current,[question._id]:event.target.value}))} className="rounded-lg border border-slate-200 px-2 py-2 text-xs font-bold"><option value="pending">Pending proof</option><option value="user_provided">User provided</option><option value="licensed">Licensed</option></select></td><td className="p-4"><span className={`rounded-full px-2.5 py-1 text-xs font-black ${verified?'bg-emerald-100 text-emerald-700':'bg-amber-100 text-amber-700'}`}>{verified?'Verified':'Incomplete'}</span></td><td className="p-4"><div className="flex gap-2"><button onClick={()=>verifyQuestion(question)} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white">Verify</button><button onClick={()=>publishQuestion(question)} disabled={!verified} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-30">Publish</button></div></td></tr>;})}{!queue.length&&<tr><td colSpan="6" className="p-12 text-center text-slate-400">No questions are waiting for verification.</td></tr>}</tbody></table></div></section>
  </div></AppShell>;
}
