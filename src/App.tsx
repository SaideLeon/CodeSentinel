import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Download,
  FileCode,
  FolderTree,
  LayoutDashboard,
  Plus,
  Printer,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  UploadCloud,
} from 'lucide-react';

type RuleSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
type ActiveView = 'workbench' | 'blueprint' | 'repository' | 'rules';

interface RepositoryFile {
  id: string;
  path: string;
  language: string;
  content: string;
}

interface Vulnerability {
  id: string;
  ruleId: string;
  title: string;
  severity: RuleSeverity;
  penaltyPoints: number;
  description: string;
  filePath: string;
  lineNumber: number;
  codeSnippet: string;
  remediation: string;
  executiveImpact: string;
}

interface RepositoryBlueprint {
  summary: string;
  architectureNotes: string[];
  priorityPlan: string[];
  repositoryMap: Array<{ path: string; language: string; lines: number; findings: number }>;
}

interface AuditReport {
  projectName: string;
  timestamp: string;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  readinessBlocker: boolean;
  vulnerabilities: Vulnerability[];
  scannedLines: number;
  rulesChecked: number;
  blueprint: RepositoryBlueprint;
}

const RULES_CATALOG = [
  { id: 'OWASP-R01', name: 'SQL Injection (SQLi)', category: 'Injection', penalty: 25, defaultSeverity: 'Critical' as RuleSeverity },
  { id: 'OWASP-R02', name: 'Broken Authentication', category: 'Auth', penalty: 20, defaultSeverity: 'Critical' as RuleSeverity },
  { id: 'OWASP-R03', name: 'Sensitive Data Exposure', category: 'Cryptography', penalty: 15, defaultSeverity: 'High' as RuleSeverity },
  { id: 'OWASP-R05', name: 'Broken Access Control', category: 'AuthZ', penalty: 20, defaultSeverity: 'Critical' as RuleSeverity },
  { id: 'OWASP-R06', name: 'Cross-Site Scripting (XSS)', category: 'Input Sanitization', penalty: 15, defaultSeverity: 'High' as RuleSeverity },
  { id: 'CTF-R07', name: 'TOCTOU Race Condition', category: 'Concurrency', penalty: 20, defaultSeverity: 'Critical' as RuleSeverity },
  { id: 'OWASP-R10', name: 'Insufficient Logging & Monitoring', category: 'Observability', penalty: 10, defaultSeverity: 'Medium' as RuleSeverity }
];

const SAMPLE_REPOSITORY: RepositoryFile[] = [
  {
    id: 'file-1',
    path: 'src/routes/auth.ts',
    language: 'TypeScript',
    content: `import express from 'express';
import db from '../db/connection';

const router = express.Router();
const JWT_SECRET = "sk_live_9918239018230912389102";

router.post('/login', async (req, res) => {
  const email = req.body.email;
  const query = ` + '`SELECT * FROM users WHERE email = \'${email}\'`' + `;
  const result = await db.query(query);

  if (result.rows[0].password_md5 === req.body.password) {
    res.json({ token: JWT_SECRET, user: result.rows[0] });
  } else {
    res.status(401).json({ error: 'E-mail não encontrado' });
  }
});`
  },
  {
    id: 'file-2',
    path: 'src/controllers/checkout.ts',
    language: 'TypeScript',
    content: `export async function checkout(req, res, db) {
  const { userId, amount } = req.body;
  const user = await db.query(` + '`SELECT credits FROM users WHERE id = ${userId}`' + `);

  if (user.rows[0].credits >= amount) {
    await processPayment(userId, amount);
    await db.query(` + '`UPDATE users SET credits = credits - ${amount} WHERE id = ${userId}`' + `);
    res.json({ success: true });
  }
}`
  }
];

const severityStyles: Record<RuleSeverity, string> = {
  Critical: 'bg-rose-500/10 text-rose-300 ring-rose-400/30',
  High: 'bg-amber-500/10 text-amber-300 ring-amber-400/30',
  Medium: 'bg-yellow-500/10 text-yellow-300 ring-yellow-400/30',
  Low: 'bg-sky-500/10 text-sky-300 ring-sky-400/30'
};

const detectLanguage = (path: string) => {
  if (path.endsWith('.ts') || path.endsWith('.tsx')) return 'TypeScript';
  if (path.endsWith('.js') || path.endsWith('.jsx')) return 'JavaScript';
  if (path.endsWith('.sql')) return 'SQL';
  if (path.endsWith('.py')) return 'Python';
  if (path.endsWith('.java')) return 'Java';
  return 'Texto';
};

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('workbench');
  const [projectName, setProjectName] = useState('CodeSentinel Repository Audit');
  const [files, setFiles] = useState<RepositoryFile[]>(SAMPLE_REPOSITORY);
  const [activeFileId, setActiveFileId] = useState(SAMPLE_REPOSITORY[0].id);
  const [newFilePath, setNewFilePath] = useState('src/new-module.ts');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [report, setReport] = useState<AuditReport | null>(null);

  const activeFile = files.find(file => file.id === activeFileId) || files[0];
  const totalLines = useMemo(() => files.reduce((total, file) => total + file.content.split('\n').length, 0), [files]);

  const updateActiveFile = (content: string) => {
    setFiles(current => current.map(file => file.id === activeFile.id ? { ...file, content } : file));
  };

  const addRepositoryFile = () => {
    const path = newFilePath.trim() || `src/module-${files.length + 1}.ts`;
    const file: RepositoryFile = { id: `file-${Date.now()}`, path, language: detectLanguage(path), content: '// Cole aqui o código deste arquivo do repositório' };
    setFiles(current => [...current, file]);
    setActiveFileId(file.id);
    setNewFilePath('');
  };

  const handleRunAudit = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const vulnerabilities: Vulnerability[] = [];
      let currentId = 1;

      files.forEach(file => {
        file.content.split('\n').forEach((line, index) => {
          const lower = line.toLowerCase();
          const base = { filePath: file.path, lineNumber: index + 1, codeSnippet: line.trim() };

          if ((lower.includes('select ') || lower.includes('update ') || lower.includes('delete ') || lower.includes('insert ')) && (line.includes('${') || line.includes(' + ') || line.includes("+'") || line.includes('"+'))) {
            vulnerabilities.push({ ...base, id: `VULN-${currentId++}`, ruleId: 'OWASP-R01', title: 'SQL Injection por query dinâmica', severity: 'Critical', penaltyPoints: 25, description: 'Query construída com interpolação ou concatenação de entrada externa.', remediation: 'Troque por prepared statements e parâmetros vinculados no driver do banco.', executiveImpact: 'Pode expor dados sensíveis, permitir fraude e bloquear conformidade LGPD.' });
          }

          if ((lower.includes('password') || lower.includes('secret') || lower.includes('api_key') || lower.includes('token')) && (line.includes('=') || line.includes(':')) && (line.includes('"') || line.includes("'")) && !lower.includes('process.env')) {
            vulnerabilities.push({ ...base, id: `VULN-${currentId++}`, ruleId: 'OWASP-R03', title: 'Segredo sensível hardcoded', severity: 'High', penaltyPoints: 15, description: 'Credencial, token ou segredo estático embutido no código.', remediation: 'Mover segredos para variáveis de ambiente ou vault com rotação.', executiveImpact: 'Vazamento de credenciais em commits, builds ou logs pode comprometer produção.' });
          }

          if (lower.includes('if (') && (lower.includes('balance') || lower.includes('credits') || lower.includes('stock') || lower.includes('amount'))) {
            vulnerabilities.push({ ...base, id: `VULN-${currentId++}`, ruleId: 'CTF-R07', title: 'Race condition TOCTOU', severity: 'Critical', penaltyPoints: 20, description: 'Estado financeiro ou cota é verificado antes de ser atualizado sem transação atômica.', remediation: 'Use transações, lock pessimista ou update condicional atômico.', executiveImpact: 'Pode gerar saldo duplicado, cobrança incorreta ou abuso por requisições concorrentes.' });
          }
        });
      });

      const totalPenalty = vulnerabilities.reduce((acc, curr) => acc + curr.penaltyPoints, 0);
      const score = Math.max(0, 100 - totalPenalty);
      const grade = score < 50 ? 'F' : score < 65 ? 'D' : score < 80 ? 'C' : score < 90 ? 'B' : 'A';
      const repositoryMap = files.map(file => ({ path: file.path, language: file.language, lines: file.content.split('\n').length, findings: vulnerabilities.filter(v => v.filePath === file.path).length }));

      setReport({
        projectName,
        timestamp: new Date().toLocaleString('pt-BR'),
        score,
        grade,
        readinessBlocker: vulnerabilities.some(v => v.severity === 'Critical') || score < 70,
        vulnerabilities,
        scannedLines: totalLines,
        rulesChecked: RULES_CATALOG.length,
        blueprint: {
          summary: `Foram lidos ${files.length} arquivos do repositório, somando ${totalLines} linhas analisadas contra ${RULES_CATALOG.length} regras.`,
          architectureNotes: ['Centralizar acesso a dados em camada de repositories com queries parametrizadas.', 'Isolar segredos em vault/ambiente e impedir commit via secret scanning.', 'Proteger fluxos financeiros com transações e locks no banco.'],
          priorityPlan: ['Corrigir falhas críticas antes de qualquer deploy.', 'Adicionar testes automatizados de regressão para cada finding.', 'Executar re-scan e exportar blueprint como artefato de release.'],
          repositoryMap
        }
      });
      setActiveView('blueprint');
      setIsAnalyzing(false);
    }, 650);
  };

  const filteredVulnerabilities = useMemo(() => {
    if (!report) return [];
    return selectedSeverity === 'All' ? report.vulnerabilities : report.vulnerabilities.filter(v => v.severity === selectedSeverity);
  }, [report, selectedSeverity]);

  const exportBlueprint = () => {
    if (!report) return;
    const md = [`# Blueprint de Segurança - ${report.projectName}`, `Data: ${report.timestamp}`, `Score: ${report.score}/100 (${report.grade})`, '', '## Mapa do repositório', ...report.blueprint.repositoryMap.map(file => `- ${file.path}: ${file.lines} linhas, ${file.findings} finding(s)`), '', '## Plano prioritário', ...report.blueprint.priorityPlan.map((item, index) => `${index + 1}. ${item}`), '', '## Findings', ...report.vulnerabilities.map(v => `### ${v.id} ${v.title}\n- Severidade: ${v.severity}\n- Local: ${v.filePath}:${v.lineNumber}\n- Correção: ${v.remediation}`)].join('\n');
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blueprint-${report.projectName.toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
  };

  const navItems = [
    { id: 'workbench' as ActiveView, label: 'Workbench', icon: LayoutDashboard },
    { id: 'blueprint' as ActiveView, label: 'Blueprint', icon: FileCode },
    { id: 'repository' as ActiveView, label: 'Repositório', icon: FolderTree },
    { id: 'rules' as ActiveView, label: 'Regras', icon: BookOpen }
  ];

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 antialiased">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.12),transparent_28%)]" />
      <div className="relative flex min-h-screen">
        <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-white/10 bg-slate-950/70 p-5 backdrop-blur-xl">
          <div className="flex items-center gap-3 pb-8">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20"><ShieldCheck /></div>
            <div><div className="font-black tracking-tight">CodeSentinel</div><div className="text-xs text-slate-500">Repository SAST Blueprint</div></div>
          </div>
          <nav className="space-y-2">
            {navItems.map(item => <button key={item.id} onClick={() => setActiveView(item.id)} className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${activeView === item.id ? 'bg-white text-slate-950' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}><item.icon className="h-4 w-4" />{item.label}<ChevronRight className="ml-auto h-4 w-4" /></button>)}
          </nav>
          <div className="mt-auto rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-4"><Sparkles className="mb-3 h-5 w-5 text-cyan-300" /><p className="text-sm font-bold">Análise multi-arquivo</p><p className="mt-1 text-xs leading-5 text-slate-400">Adicione código proveniente do repositório, leia todos os arquivos enviados e gere um blueprint acionável.</p></div>
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/20 lg:flex-row lg:items-center lg:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">Security command center</p><h1 className="mt-2 text-3xl font-black tracking-tight text-white">Auditoria minimalista com blueprint detalhado</h1><p className="mt-2 max-w-2xl text-sm text-slate-400">Cole arquivos do repositório, revise o mapa de superfície e execute uma análise estática para produzir plano de correção.</p></div>
            <button onClick={handleRunAudit} disabled={isAnalyzing} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-300 disabled:opacity-60">{isAnalyzing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}Analisar todo o repositório</button>
          </header>

          {activeView === 'workbench' && <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
            <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/70 p-5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Projeto</label><input value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-cyan-400" />
              <div className="grid grid-cols-3 gap-3 pt-2"><Metric label="Arquivos" value={files.length} /><Metric label="Linhas" value={totalLines} /><Metric label="Regras" value={RULES_CATALOG.length} /></div>
              <div className="pt-3"><div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Arquivos lidos</div><div className="space-y-2">{files.map(file => <button key={file.id} onClick={() => setActiveFileId(file.id)} className={`w-full rounded-2xl border p-3 text-left text-xs transition ${activeFile.id === file.id ? 'border-cyan-400/60 bg-cyan-400/10' : 'border-white/10 bg-slate-950 hover:bg-white/5'}`}><div className="font-mono text-slate-200">{file.path}</div><div className="mt-1 text-slate-500">{file.language} · {file.content.split('\n').length} linhas</div></button>)}</div></div>
              <div className="flex gap-2 pt-2"><input value={newFilePath} onChange={e => setNewFilePath(e.target.value)} placeholder="src/api/file.ts" className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-950 px-3 py-2 text-xs outline-none focus:border-cyan-400" /><button onClick={addRepositoryFile} className="rounded-2xl bg-white px-3 py-2 text-slate-950"><Plus className="h-4 w-4" /></button></div>
            </div>
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl"><div className="flex items-center justify-between border-b border-white/10 bg-slate-900/80 px-4 py-3 text-xs text-slate-400"><span className="flex items-center gap-2 font-mono"><Terminal className="h-4 w-4 text-cyan-300" />{activeFile.path}</span><span>{activeFile.language}</span></div><textarea value={activeFile.content} onChange={e => updateActiveFile(e.target.value)} rows={24} className="h-[580px] w-full resize-none bg-slate-950 p-5 font-mono text-sm leading-6 text-slate-200 outline-none" /></div>
          </section>}

          {activeView === 'blueprint' && <section className="space-y-6">{report ? <><div className="grid gap-4 md:grid-cols-4"><Metric label="Score" value={`${report.score}/100`} /><Metric label="Nota" value={report.grade} /><Metric label="Findings" value={report.vulnerabilities.length} /><Metric label="Linhas" value={report.scannedLines} /></div><div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6"><div className="flex flex-col justify-between gap-4 md:flex-row"><div><h2 className="text-xl font-black">Blueprint de remediação</h2><p className="mt-1 text-sm text-slate-400">{report.blueprint.summary}</p></div><div className="flex gap-2"><button onClick={exportBlueprint} className="rounded-2xl bg-slate-800 px-4 py-2 text-xs font-bold"><Download className="mr-2 inline h-4 w-4" />Markdown</button><button onClick={() => window.print()} className="rounded-2xl bg-slate-800 px-4 py-2 text-xs font-bold"><Printer className="mr-2 inline h-4 w-4" />PDF</button></div></div><div className="mt-6 grid gap-4 lg:grid-cols-2"><Panel title="Arquitetura recomendada" items={report.blueprint.architectureNotes} /><Panel title="Plano prioritário" items={report.blueprint.priorityPlan} /></div></div><div className="flex flex-wrap gap-2">{['All', 'Critical', 'High', 'Medium', 'Low'].map(sev => <button key={sev} onClick={() => setSelectedSeverity(sev)} className={`rounded-full px-3 py-1 text-xs font-bold ${selectedSeverity === sev ? 'bg-cyan-400 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>{sev === 'All' ? 'Todas' : sev}</button>)}</div><div className="space-y-3">{filteredVulnerabilities.map(v => <article key={v.id} className="rounded-3xl border border-white/10 bg-slate-900/70 p-5"><div className="flex flex-wrap items-center gap-3"><span className={`rounded-full px-2.5 py-1 text-[11px] font-black ring-1 ${severityStyles[v.severity]}`}>{v.severity}</span><h3 className="font-bold text-white">{v.title}</h3><span className="font-mono text-xs text-slate-500">{v.filePath}:{v.lineNumber}</span></div><p className="mt-3 text-sm text-slate-400">{v.description}</p><pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-cyan-100"><code>{v.codeSnippet}</code></pre><p className="mt-4 text-sm text-slate-300"><b>Correção:</b> {v.remediation}</p></article>)}</div></> : <EmptyState />}</section>}

          {activeView === 'repository' && <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6"><h2 className="text-xl font-black">Mapa do repositório</h2><div className="mt-5 grid gap-3">{(report?.blueprint.repositoryMap || files.map(f => ({ path: f.path, language: f.language, lines: f.content.split('\n').length, findings: 0 }))).map(file => <div key={file.path} className="grid gap-2 rounded-2xl border border-white/10 bg-slate-950 p-4 text-sm md:grid-cols-[1fr_120px_100px_120px]"><span className="font-mono text-slate-200">{file.path}</span><span className="text-slate-400">{file.language}</span><span className="text-slate-400">{file.lines} linhas</span><span className="font-bold text-cyan-300">{file.findings} findings</span></div>)}</div></section>}

          {activeView === 'rules' && <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{RULES_CATALOG.map(rule => <div key={rule.id} className="rounded-3xl border border-white/10 bg-slate-900/70 p-5"><div className="flex items-center justify-between"><span className="font-mono text-xs text-cyan-300">{rule.id}</span><span className={`rounded-full px-2 py-1 text-[10px] font-black ring-1 ${severityStyles[rule.defaultSeverity]}`}>{rule.defaultSeverity}</span></div><h3 className="mt-4 font-bold text-white">{rule.name}</h3><p className="mt-2 text-xs text-slate-500">{rule.category} · penalidade {rule.penalty} pts</p></div>)}</section>}
        </main>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</div><div className="mt-2 text-2xl font-black text-white">{value}</div></div>;
}

function Panel({ title, items }: { title: string; items: string[] }) {
  return <div className="rounded-2xl border border-white/10 bg-slate-950 p-4"><h3 className="mb-3 text-sm font-black text-white">{title}</h3><ul className="space-y-2 text-sm text-slate-400">{items.map(item => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />{item}</li>)}</ul></div>;
}

function EmptyState() {
  return <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/50 p-12 text-center"><UploadCloud className="mx-auto h-10 w-10 text-slate-600" /><h2 className="mt-4 text-lg font-black text-white">Nenhum blueprint gerado ainda</h2><p className="mt-2 text-sm text-slate-400">Use “Analisar todo o repositório” para ler todos os arquivos adicionados e criar o blueprint.</p></div>;
}
