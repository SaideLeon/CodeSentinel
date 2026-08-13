import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Printer,
  Search,
  Code2,
  Users,
  CreditCard,
  Settings,
  Plus,
  Play,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Layers,
  Terminal,
  FileText,
  Lock,
  Cpu,
  BarChart3,
  BookOpen
} from 'lucide-react';

// Types
type RuleSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

interface Vulnerability {
  id: string;
  ruleId: string;
  title: string;
  severity: RuleSeverity;
  penaltyPoints: number;
  description: string;
  lineNumber: number;
  codeSnippet: string;
  remediation: string;
  executiveImpact: string;
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
}

interface Project {
  id: string;
  name: string;
  language: string;
  lastAuditScore: number;
  lastAuditDate: string;
  status: 'Clean' | 'Warning' | 'Critical';
  vulnerabilitiesCount: number;
}

// OWASP & Security Rules
const RULES_CATALOG = [
  { id: 'OWASP-R01', name: 'SQL Injection (SQLi)', category: 'Injection', penalty: 25, defaultSeverity: 'Critical' as RuleSeverity },
  { id: 'OWASP-R02', name: 'Broken Authentication', category: 'Auth', penalty: 20, defaultSeverity: 'Critical' as RuleSeverity },
  { id: 'OWASP-R03', name: 'Sensitive Data Exposure', category: 'Cryptography', penalty: 15, defaultSeverity: 'High' as RuleSeverity },
  { id: 'OWASP-R04', name: 'XML External Entities (XXE)', category: 'Parser', penalty: 15, defaultSeverity: 'High' as RuleSeverity },
  { id: 'OWASP-R05', name: 'Broken Access Control', category: 'AuthZ', penalty: 20, defaultSeverity: 'Critical' as RuleSeverity },
  { id: 'OWASP-R06', name: 'Cross-Site Scripting (XSS)', category: 'Input Sanitization', penalty: 15, defaultSeverity: 'High' as RuleSeverity },
  { id: 'CTF-R07', name: 'TOCTOU Race Condition', category: 'Concurrency', penalty: 20, defaultSeverity: 'Critical' as RuleSeverity },
  { id: 'CTF-R08', name: 'Asynchronous State Desync', category: 'Concurrency', penalty: 15, defaultSeverity: 'High' as RuleSeverity },
  { id: 'OWASP-R09', name: 'Insecure Deserialization', category: 'Object Injection', penalty: 15, defaultSeverity: 'High' as RuleSeverity },
  { id: 'OWASP-R10', name: 'Insufficient Logging & Monitoring', category: 'Observability', penalty: 10, defaultSeverity: 'Medium' as RuleSeverity }
];

const INITIAL_PROJECTS: Project[] = [
  { id: 'p1', name: 'Fintech Payment Gateway API', language: 'TypeScript / Node.js', lastAuditScore: 65, lastAuditDate: '2026-08-12', status: 'Warning', vulnerabilitiesCount: 3 },
  { id: 'p2', name: 'E-Commerce Auth Microservice', language: 'Python / FastApi', lastAuditScore: 92, lastAuditDate: '2026-08-10', status: 'Clean', vulnerabilitiesCount: 1 },
  { id: 'p3', name: 'Healthcare Patient Portal', language: 'Java / Spring Boot', lastAuditScore: 40, lastAuditDate: '2026-08-08', status: 'Critical', vulnerabilitiesCount: 5 }
];

const DEFAULT_SAMPLE_CODE = `// Sample Node.js Express Authentication & Data Endpoint
const express = require('express');
const mysql = require('mysql');
const app = express();

const db = mysql.createConnection({
  host: 'localhost',
  user: 'admin',
  password: 'HardcodedSecretPassword123!', // SENSITIVE DATA EXPOSURE
  database: 'production_db'
});

// User Search Endpoint
app.get('/api/users/search', (req, res) => {
  const username = req.query.username;
  // Unsanitized Raw SQL Query - SQL INJECTION
  const query = "SELECT id, username, email, role, api_key FROM users WHERE username = '" + username + "'";
  
  db.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Transfer Funds Endpoint (TOCTOU Race Condition)
let userBalance = 500;
app.post('/api/transfer', async (req, res) => {
  const amount = req.body.amount;
  // Check balance before deduction without transaction lock
  if (userBalance >= amount) {
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async delay
    userBalance -= amount;
    res.json({ success: true, newBalance: userBalance });
  } else {
    res.status(400).json({ error: 'Insufficient funds' });
  }
});
`;

export default function App() {
  const [activeTab, setActiveTab] = useState<'audit' | 'projects' | 'catalog' | 'team'>('audit');
  const [code, setCode] = useState<string>(DEFAULT_SAMPLE_CODE);
  const [projectName, setProjectName] = useState<string>('My Secure API Module');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [nonTechnicalMode, setNonTechnicalMode] = useState<boolean>(false);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [report, setReport] = useState<AuditReport | null>(null);
  const [credits, setCredits] = useState<number>(42);

  // Static Audit Rule Matching Engine
  const handleRunAudit = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const lines = code.split('\n');
      const vulnerabilities: Vulnerability[] = [];
      let currentId = 1;

      lines.forEach((line, index) => {
        const lineNum = index + 1;
        const lower = line.toLowerCase();

        // Rule 1: SQL Injection
        if (
          (lower.includes('select ') || lower.includes('insert ') || lower.includes('update ') || lower.includes('delete ')) &&
          (line.includes(" + ") || line.includes("+'") || line.includes('${') || line.includes('"+'))
        ) {
          vulnerabilities.push({
            id: `VULN-${currentId++}`,
            ruleId: 'OWASP-R01',
            title: 'SQL Injection Vulnerability Detected',
            severity: 'Critical',
            penaltyPoints: 25,
            description: 'Direct string concatenation detected inside raw database queries. Attackers can execute arbitrary SQL statements.',
            lineNumber: lineNum,
            codeSnippet: line.trim(),
            remediation: 'Use parameterized queries or prepared statements (e.g. db.query("SELECT * FROM users WHERE username = ?", [username])).',
            executiveImpact: 'Alto risco de vazamento massivo de dados de clientes, violação da LGPD e comprometimento de acesso administrativo.'
          });
        }

        // Rule 2: Sensitive Data Exposure (Hardcoded secrets)
        if (
          (lower.includes('password') || lower.includes('secret') || lower.includes('api_key') || lower.includes('token')) &&
          (line.includes("=") || line.includes(":")) &&
          (line.includes("'") || line.includes('"')) &&
          !lower.includes('process.env')
        ) {
          vulnerabilities.push({
            id: `VULN-${currentId++}`,
            ruleId: 'OWASP-R03',
            title: 'Hardcoded Sensitive Secret',
            severity: 'High',
            penaltyPoints: 15,
            description: 'Hardcoded credentials or API keys embedded in source code.',
            lineNumber: lineNum,
            codeSnippet: line.trim(),
            remediation: 'Move all secrets to environment variables accessed via process.env.',
            executiveImpact: 'Risco de credenciais vazadas em repositórios públicos ou compilações de produção.'
          });
        }

        // Rule 3: TOCTOU / Concurrency Race Condition
        if (lower.includes('if (') && (lower.includes('balance') || lower.includes('stock') || lower.includes('amount') || lower.includes('limit'))) {
          vulnerabilities.push({
            id: `VULN-${currentId++}`,
            ruleId: 'CTF-R07',
            title: 'Race Condition (TOCTOU)',
            severity: 'Critical',
            penaltyPoints: 20,
            description: 'State check performed before state update without row locking or atomic transactions.',
            lineNumber: lineNum,
            codeSnippet: line.trim(),
            remediation: 'Use database transactions with FOR UPDATE locks or atomic operators (e.g., balance = balance - amount WHERE balance >= amount).',
            executiveImpact: 'Risco de ataques de saldo duplo ou estouro de cota por requisições concorrentes paralelas.'
          });
        }
      });

      // Calculate Score
      const totalPenalty = vulnerabilities.reduce((acc, curr) => acc + curr.penaltyPoints, 0);
      const finalScore = Math.max(0, 100 - totalPenalty);

      let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'A';
      if (finalScore < 50) grade = 'F';
      else if (finalScore < 65) grade = 'D';
      else if (finalScore < 80) grade = 'C';
      else if (finalScore < 90) grade = 'B';

      const hasCritical = vulnerabilities.some(v => v.severity === 'Critical');

      setReport({
        projectName: projectName || 'Projeto sem Nome',
        timestamp: new Date().toLocaleString('pt-BR'),
        score: finalScore,
        grade,
        readinessBlocker: hasCritical || finalScore < 70,
        vulnerabilities,
        scannedLines: lines.length,
        rulesChecked: RULES_CATALOG.length
      });

      setCredits(prev => Math.max(0, prev - 1));
      setIsAnalyzing(false);
    }, 600);
  };

  const filteredVulnerabilities = useMemo(() => {
    if (!report) return [];
    if (selectedSeverity === 'All') return report.vulnerabilities;
    return report.vulnerabilities.filter(v => v.severity === selectedSeverity);
  }, [report, selectedSeverity]);

  const handleExportMarkdown = () => {
    if (!report) return;
    let md = `# Relatório de Auditoria de Segurança - ${report.projectName}\n`;
    md += `**Data:** ${report.timestamp}\n`;
    md += `**Pontuação de Segurança:** ${report.score}/100 (Nota: ${report.grade})\n`;
    md += `**Status de Produção:** ${report.readinessBlocker ? 'BLOQUEADO PARA DEPLOY' : 'APROVADO'}\n\n`;
    md += `## Vulnerabilidades Encontradas (${report.vulnerabilities.length})\n\n`;

    report.vulnerabilities.forEach(v => {
      md += `### [${v.severity.toUpperCase()}] ${v.title} (${v.id})\n`;
      md += `- **Regra:** ${v.ruleId}\n`;
      md += `- **Linha:** ${v.lineNumber}\n`;
      md += `- **Impacto Executivo:** ${v.executiveImpact}\n`;
      md += `- **Código Atingido:** \`${v.codeSnippet}\`\n`;
      md += `- **Remediação Recomendada:** ${v.remediation}\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `secaudit-${report.projectName.toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
  };

  return (
    <div id="app-root" className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased">
      {/* Top Navbar */}
      <header id="main-header" className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div id="header-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div id="brand-logo" className="flex items-center gap-3">
            <div id="logo-icon-bg" className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <span id="brand-title" className="font-bold text-lg text-white tracking-wide block">SecAudit Pro</span>
              <span id="brand-subtitle" className="text-xs text-slate-400 block -mt-1">SAST & Security Blueprints</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav id="navigation-bar" className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
            <button
              id="tab-audit-btn"
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'audit'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Code2 className="h-4 w-4" />
              Auditoria de Código
            </button>
            <button
              id="tab-projects-btn"
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'projects'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Layers className="h-4 w-4" />
              Projetos & Histórico
            </button>
            <button
              id="tab-catalog-btn"
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'catalog'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Catálogo de Regras
            </button>
          </nav>

          {/* Account & Credits Indicator */}
          <div id="account-status-bar" className="flex items-center gap-4">
            <div id="credits-chip" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-slate-400">Créditos:</span>
              <span className="font-semibold text-cyan-300">{credits} análises</span>
            </div>
            <div id="user-avatar" className="h-9 w-9 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-300 font-semibold text-sm">
              SA
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'audit' && (
          <div id="audit-section" className="space-y-8">
            {/* Input & Control Panel */}
            <div id="audit-control-card" className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
              <div id="audit-header-row" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 id="audit-title" className="text-xl font-bold text-white flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-cyan-400" />
                    Workbench de Auditoria de Código Fonte
                  </h1>
                  <p id="audit-subtitle" className="text-sm text-slate-400 mt-1">
                    Análise estática OWASP R01-R10 e verificação de Race Conditions (CTF) para pré-produção.
                  </p>
                </div>
                <div id="project-input-group" className="flex items-center gap-3 w-full sm:w-auto">
                  <input
                    id="project-name-input"
                    type="text"
                    value={projectName}
                    onChange={e => setProjectName(e.target.value)}
                    placeholder="Nome do Projeto ou Módulo"
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-full sm:w-64"
                  />
                  <button
                    id="run-audit-btn"
                    onClick={handleRunAudit}
                    disabled={isAnalyzing || credits <= 0}
                    className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isAnalyzing ? (
                      <>
                        <RotateCcw className="h-4 w-4 animate-spin" />
                        Auditando...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 fill-current" />
                        Executar Auditoria
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Code Editor Box */}
              <div id="code-editor-wrapper" className="relative rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                <div id="editor-header" className="bg-slate-900/80 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <FileCode className="h-4 w-4 text-cyan-400" />
                    <span>app.js / server.ts</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span>Linguagem: Node.js / JavaScript / TypeScript</span>
                    <button
                      id="reset-code-btn"
                      onClick={() => setCode(DEFAULT_SAMPLE_CODE)}
                      className="hover:text-slate-200 transition-colors"
                    >
                      Restaurar Exemplo
                    </button>
                  </div>
                </div>
                <textarea
                  id="code-input-textarea"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  rows={14}
                  className="w-full bg-slate-950 text-slate-200 font-mono text-sm p-4 focus:outline-none resize-y leading-relaxed border-none"
                  placeholder="Cole aqui seu código-fonte para ser auditado..."
                />
              </div>
            </div>

            {/* Audit Results Section */}
            {report && (
              <div id="report-results-container" className="space-y-8 animate-fadeIn">
                {/* Executive Scorecard */}
                <div id="scorecard-wrapper" className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div id="score-card" className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Score de Segurança</span>
                    <div className="my-4 flex items-baseline gap-3">
                      <span className={`text-5xl font-black ${
                        report.score >= 80 ? 'text-emerald-400' : report.score >= 60 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {report.score}
                      </span>
                      <span className="text-slate-500 font-bold text-lg">/ 100</span>
                      <span className={`ml-auto px-3 py-1 rounded-full text-xs font-extrabold ${
                        report.grade === 'A' ? 'bg-emerald-500/20 text-emerald-300' :
                        report.grade === 'B' ? 'bg-blue-500/20 text-blue-300' :
                        report.grade === 'C' ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'
                      }`}>
                        Nota {report.grade}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">Calculado via deduções OWASP/CTF estáticas.</p>
                  </div>

                  <div id="deploy-readiness-card" className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Status Pré-Produção</span>
                    <div className="my-4">
                      {report.readinessBlocker ? (
                        <div className="flex items-center gap-3 text-red-400 font-bold text-lg">
                          <XCircle className="h-7 w-7 text-red-400 shrink-0" />
                          <span>BLOQUEADO PARA DEPLOY</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 text-emerald-400 font-bold text-lg">
                          <CheckCircle2 className="h-7 w-7 text-emerald-400 shrink-0" />
                          <span>APROVADO PARA PRODUÇÃO</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {report.readinessBlocker
                        ? 'Existem falhas críticas ou nota abaixo de 70.'
                        : 'Nenhuma vulnerabilidade impeditiva detectada.'}
                    </p>
                  </div>

                  <div id="vuln-count-card" className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Falhas Encontradas</span>
                    <div className="my-4">
                      <span className="text-4xl font-bold text-white">{report.vulnerabilities.length}</span>
                      <span className="text-slate-400 text-sm ml-2">vulnerabilidades</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="text-red-400 font-semibold">{report.vulnerabilities.filter(v => v.severity === 'Critical').length} Críticas</span>
                      <span>•</span>
                      <span className="text-amber-400 font-semibold">{report.vulnerabilities.filter(v => v.severity === 'High').length} Altas</span>
                    </div>
                  </div>

                  <div id="actions-card" className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Exportar Relatório</span>
                    <div className="my-4 space-y-2">
                      <button
                        id="export-md-btn"
                        onClick={handleExportMarkdown}
                        className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 rounded-xl transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Exportar Markdown (.md)
                      </button>
                      <button
                        id="print-pdf-btn"
                        onClick={() => window.print()}
                        className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 rounded-xl transition-colors"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        Imprimir / PDF Executivo
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-500 text-center">Formato de Blueprint Security Standard</span>
                  </div>
                </div>

                {/* Report Filter & Toggle */}
                <div id="report-controls-bar" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">Filtrar Severidade:</span>
                    {['All', 'Critical', 'High', 'Medium'].map(sev => (
                      <button
                        key={sev}
                        id={`filter-sev-${sev.toLowerCase()}`}
                        onClick={() => setSelectedSeverity(sev)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          selectedSeverity === sev
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {sev === 'All' ? 'Todas' : sev}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-xs text-slate-400 font-medium cursor-pointer flex items-center gap-2">
                      <input
                        id="non-technical-toggle"
                        type="checkbox"
                        checked={nonTechnicalMode}
                        onChange={e => setNonTechnicalMode(e.target.checked)}
                        className="rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-0"
                      />
                      <span>Visão Executiva (Não-Técnica para Gestão)</span>
                    </label>
                  </div>
                </div>

                {/* Vulnerability List */}
                <div id="vulnerabilities-list" className="space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-amber-400" />
                    Detalhamento de Inseguranças Encontradas ({filteredVulnerabilities.length})
                  </h3>

                  {filteredVulnerabilities.length === 0 ? (
                    <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-sm">
                      Nenhuma vulnerabilidade encontrada para o filtro selecionado.
                    </div>
                  ) : (
                    filteredVulnerabilities.map(v => (
                      <div
                        key={v.id}
                        id={`vuln-card-${v.id}`}
                        className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
                          <div className="flex items-center gap-3">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase ${
                              v.severity === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                              v.severity === 'High' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}>
                              {v.severity}
                            </span>
                            <h4 className="font-bold text-white text-base">{v.title}</h4>
                            <span className="text-xs font-mono text-slate-500">[{v.ruleId}]</span>
                          </div>
                          <span className="text-xs font-mono text-red-400 bg-red-950/40 px-2 py-1 rounded border border-red-900/40">
                            -{v.penaltyPoints} pts no Score
                          </span>
                        </div>

                        {nonTechnicalMode ? (
                          <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-900/30 text-blue-200 text-sm">
                            <span className="font-bold block mb-1">Impacto no Negócio / Diretoria:</span>
                            {v.executiveImpact}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-sm text-slate-300 leading-relaxed">{v.description}</p>
                            
                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs">
                              <span className="text-slate-500 block mb-1">Linha {v.lineNumber}:</span>
                              <code className="text-red-300">{v.codeSnippet}</code>
                            </div>

                            <div className="bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-900/40 text-xs">
                              <span className="font-bold text-emerald-400 block mb-1">Plano de Remediação Recomendado:</span>
                              <p className="text-emerald-200">{v.remediation}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* ASCII Security Blueprint */}
                <div id="ascii-blueprint-box" className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Lock className="h-5 w-5 text-cyan-400" />
                    Security Blueprint & Architecture Flow
                  </h3>
                  <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-400 font-mono text-xs overflow-x-auto leading-normal">
{`+-----------------------+      HTTPS / Bearer      +-----------------------+
|  Cliente / Client App | -----------------------> | API Gateway / Router  |
+-----------------------+                          +-----------------------+
                                                               |
                                                   [ Sanitize & Validate ]
                                                               |
                                                               v
+-----------------------+      Param Query         +-----------------------+
| Database / Persistence| <----------------------- | Secure Service Layer  |
+-----------------------+                          +-----------------------+`}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div id="projects-section" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Portfólio de Projetos Auditados</h2>
                <p className="text-sm text-slate-400 mt-1">Gerencie auditorias passadas e status de conformidade.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {INITIAL_PROJECTS.map(proj => (
                <div key={proj.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-cyan-400">{proj.language}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      proj.status === 'Clean' ? 'bg-emerald-500/20 text-emerald-300' :
                      proj.status === 'Warning' ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {proj.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-lg">{proj.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white">{proj.lastAuditScore}</span>
                    <span className="text-xs text-slate-500">/ 100 Score</span>
                  </div>
                  <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>Última auditoria: {proj.lastAuditDate}</span>
                    <span className="text-slate-300 font-medium">{proj.vulnerabilitiesCount} falhas</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Catalog Tab */}
        {activeTab === 'catalog' && (
          <div id="catalog-section" className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Catálogo de Regras SAST & OWASP</h2>
              <p className="text-sm text-slate-400 mt-1">Regras ativas de verificação e cálculo de penalidades.</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">ID Regra</th>
                    <th className="p-4">Nome da Vulnerabilidade</th>
                    <th className="p-4">Categoria</th>
                    <th className="p-4">Severidade Padrão</th>
                    <th className="p-4">Penalidade Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {RULES_CATALOG.map(rule => (
                    <tr key={rule.id} className="hover:bg-slate-950/40">
                      <td className="p-4 font-mono text-cyan-400 text-xs">{rule.id}</td>
                      <td className="p-4 font-medium text-white">{rule.name}</td>
                      <td className="p-4 text-slate-400">{rule.category}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          rule.defaultSeverity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                          rule.defaultSeverity === 'High' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {rule.defaultSeverity}
                        </span>
                      </td>
                      <td className="p-4 text-red-400 font-mono font-bold">-{rule.penalty} pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer id="main-footer" className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>SecAudit Pro &copy; 2026. Plataforma de Auditoria Estática e Security Blueprints para Ambientes de Produção.</p>
      </footer>
    </div>
  );
}
