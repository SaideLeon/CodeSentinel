"use client";

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Play, 
  Code2, 
  Upload, 
  Github, 
  CheckCircle2, 
  ArrowLeft, 
  Clock, 
  FileCode, 
  RefreshCw, 
  ChevronRight, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { store } from '@/lib/store/security-store';

const SAMPLE_VULNERABLE_CODE = `// Rota crítica de autenticação e pagamentos
import express from 'express';
import db from '../db/connection';

const app = express();
app.use(express.json());

// R03: Secret Hardcoded
const JWT_SECRET = "sk_live_9918239018230912389102";

// R10: SQL Injection em Concatenação de Email
app.post('/api/auth/login', async (req, res) => {
  const email = req.body.email;
  const query = \`SELECT * FROM users WHERE email = '\${email}'\`;
  const result = await db.query(query);
  
  // R01: Comparação de senha MD5 legada
  if (result.rows.length > 0 && result.rows[0].password_md5 === req.body.password) {
    res.json({ token: "jwt_token_here", user: result.rows[0] });
  } else {
    // R02: Revela se o email existe ou não
    res.status(401).json({ error: "E-mail não encontrado na base de dados" });
  }
});

// CTF-R07: Leitura de saldo FORA da transação (Race Condition em checkout)
app.post('/api/payments/checkout', async (req, res) => {
  const { userId, amount } = req.body;
  const user = await db.query(\`SELECT credits FROM users WHERE id = \${userId}\`);
  
  if (user.rows[0].credits >= amount) {
    await processStripePayment(userId, amount);
    await db.query(\`UPDATE users SET credits = credits - \${amount} WHERE id = \${userId}\`);
    res.json({ success: true });
  }
});
`;

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const project = store.getProjectById(resolvedParams.id);
  const audits = store.getAuditsByProjectId(resolvedParams.id);
  const sub = store.getSubscription();

  const [activeTab, setActiveTab] = useState<'paste' | 'upload' | 'github'>('paste');
  const [codeContent, setCodeContent] = useState(SAMPLE_VULNERABLE_CODE);
  const [githubRepo, setGithubRepo] = useState(project?.repositoryUrl || 'github.com/org/repo');
  const [selectedGithubFiles, setSelectedGithubFiles] = useState<string[]>([
    'src/routes/auth.ts',
    'src/controllers/paymentController.ts',
    'src/middleware/checkAuth.ts',
    'supabase/migrations/001_schema.sql'
  ]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  if (!project) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-4">
        <AlertCircle className="w-10 h-10 mx-auto text-slate-500" />
        <p className="text-base font-semibold">Projeto não encontrado.</p>
        <Link href="/dashboard" className="text-cyan-400 hover:underline text-xs">
          Voltar para o Dashboard
        </Link>
      </div>
    );
  }

  const handleRunAudit = async (isRescan = false) => {
    setIsAnalyzing(true);
    setAnalysisError('');

    try {
      let finalCodeToAnalyze = codeContent;
      let sourceType: 'PASTE' | 'FILE_UPLOAD' | 'GITHUB' = 'PASTE';
      let sourceDetails = 'Editor de código';

      if (activeTab === 'github') {
        sourceType = 'GITHUB';
        sourceDetails = `Repositório ${githubRepo} (${selectedGithubFiles.length} arquivos críticos)`;
        finalCodeToAnalyze = `// Código importado do GitHub: ${githubRepo}\n` + SAMPLE_VULNERABLE_CODE;
      } else if (activeTab === 'upload') {
        sourceType = 'FILE_UPLOAD';
        sourceDetails = 'Ficheiros compactados enviados';
      }

      const res = await fetch('/api/audit/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          codeContent: finalCodeToAnalyze,
          sourceType,
          sourceDetails,
          isRescan
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao realizar análise.');
      }

      // Redirect to the newly created audit report
      router.push(`/dashboard/audit/${data.audit.id}`);
    } catch (err: any) {
      setAnalysisError(err.message || 'Falha ao processar a auditoria.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Back Link & Header */}
      <div className="space-y-4">
        <Link 
          href="/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Dashboard</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-white">{project.name}</h1>
              {project.productionReady ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950 border border-emerald-800 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Aprovado p/ Produção</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-950 border border-rose-800 text-rose-400">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Bloqueado em Produção</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">{project.description}</p>
          </div>

          <div className="flex items-center space-x-4 bg-slate-900 p-3 rounded-xl border border-slate-800">
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase">Último Score</div>
              <div className={`text-xl font-black ${
                (project.latestScore || 0) >= 85 ? 'text-emerald-400' :
                (project.latestScore || 0) >= 70 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {project.latestScore !== undefined ? `${project.latestScore}/100` : 'Sem dados'}
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase">Execuções</div>
              <div className="text-sm font-bold text-slate-200">{project.auditCount} auditorias</div>
            </div>
          </div>
        </div>
      </div>

      {/* Code Submission Box */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Code2 className="w-5 h-5 text-cyan-400" />
              <span>Submeter Código para Auditoria</span>
            </h2>
            <p className="text-xs text-slate-400">Selecione o método de importação e inicie a validação das regras de segurança.</p>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setActiveTab('paste')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${
                activeTab === 'paste' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Colar Código</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${
                activeTab === 'upload' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Ficheiros</span>
            </button>
            <button
              onClick={() => setActiveTab('github')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${
                activeTab === 'github' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub Import</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {analysisError && (
            <div className="p-3 bg-rose-950/80 border border-rose-800/80 rounded-xl text-rose-300 text-xs font-medium flex items-center justify-between">
              <span>{analysisError}</span>
              <Link href="/dashboard/billing" className="text-cyan-400 underline ml-2 font-bold">Ver Planos</Link>
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400">Cole trechos das rotas, middlewares, controllers ou SQL abaixo:</label>
              <textarea
                rows={12}
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                placeholder="// Cole o seu código TypeScript, Express, Next.js ou SQL aqui..."
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed resize-y"
              />
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950 p-10 rounded-xl text-center space-y-3 cursor-pointer transition-colors">
              <Upload className="w-10 h-10 text-cyan-400 mx-auto" />
              <div className="text-sm font-semibold text-slate-200">Arraste a pasta compactada (.zip) ou ficheiros .ts, .js, .sql</div>
              <p className="text-xs text-slate-500">Tamanho máximo de 200KB por submissão. Os ficheiros são analisados em memória server-side isolada.</p>
              <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg">
                Selecionar do Computador
              </button>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
                  <Github className="w-4 h-4 text-cyan-400" />
                  <span>Repositório Conectado via OAuth</span>
                </div>
                <input 
                  type="text"
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400">Ficheiros Críticos Detectados no Repositório:</label>
                <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800 max-h-48 overflow-y-auto">
                  {selectedGithubFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs font-mono p-2 bg-slate-900 rounded border border-slate-800/60">
                      <span className="text-slate-300">{file}</span>
                      <span className="text-[10px] text-emerald-400 font-bold">Pronto p/ Análise</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Trigger Button & Credit warning */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80">
            <div className="text-xs text-slate-400 font-mono">
              Consome <span className="text-cyan-400 font-bold">1 Crédito</span> ({sub.creditsUsed}/{sub.creditsLimit} utilizados no ciclo)
            </div>

            <div className="flex space-x-3 w-full sm:w-auto">
              {audits.length > 0 && (
                <button
                  onClick={() => handleRunAudit(true)}
                  disabled={isAnalyzing}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center space-x-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>Executar Re-Scan Rápido</span>
                </button>
              )}

              <button
                onClick={() => handleRunAudit(false)}
                disabled={isAnalyzing}
                className="w-full sm:w-auto px-6 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 text-xs transition-all flex items-center justify-center space-x-2"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Motor a Analisar Regras...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current stroke-none" />
                    <span>Iniciar Auditoria de Segurança</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Audit History Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800">
          <h2 className="text-base font-bold text-white">Histórico de Auditorias Deste Projeto</h2>
          <p className="text-xs text-slate-400">Registo de execuções anteriores, evolução do score e relatórios.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="p-4">Execução / Data</th>
                <th className="p-4">Origem</th>
                <th className="p-4">Score</th>
                <th className="p-4">Classificação</th>
                <th className="p-4">Críticos / Altos</th>
                <th className="p-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {audits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Nenhuma auditoria executada ainda neste projeto.
                  </td>
                </tr>
              ) : (
                audits.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 text-slate-300 font-semibold">
                      <div className="flex items-center space-x-2">
                        <span>{a.id}</span>
                        {a.isRescan && <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-400">Re-scan</span>}
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal">
                        {new Date(a.createdAt).toLocaleString('pt-PT')}
                      </div>
                    </td>

                    <td className="p-4 text-slate-400">
                      <div>{a.sourceType}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[150px]">{a.sourceDetails}</div>
                    </td>

                    <td className="p-4">
                      <span className={`text-sm font-extrabold ${
                        a.score >= 85 ? 'text-emerald-400' : a.score >= 70 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {a.score}/100
                      </span>
                    </td>

                    <td className="p-4">
                      {a.verdict === 'APROVADO_COM_DISTINCAO' && (
                        <span className="text-emerald-400 font-bold">Aprovado c/ Distinção</span>
                      )}
                      {a.verdict === 'APROVADO_COM_RESSALVAS' && (
                        <span className="text-amber-400 font-bold">Aprovado c/ Ressalvas</span>
                      )}
                      {a.verdict === 'APROVADO_CONDICIONALMENTE' && (
                        <span className="text-yellow-400 font-bold">Aprovado Condicional</span>
                      )}
                      {a.verdict === 'REPROVADO' && (
                        <span className="text-rose-400 font-bold">Reprovado</span>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-rose-400 font-bold">{a.totalCritical} C</span>
                        <span className="text-amber-400 font-bold">{a.totalHigh} A</span>
                        <span className="text-yellow-400 font-bold">{a.totalMedium} M</span>
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <Link
                        href={`/dashboard/audit/${a.id}`}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold inline-flex items-center space-x-1"
                      >
                        <span>Abrir Relatório</span>
                        <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
