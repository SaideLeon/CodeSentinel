"use client";

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, 
  ShieldCheck, 
  ArrowLeft, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Check, 
  X, 
  ExternalLink, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Filter, 
  Code2, 
  Layers,
  ChevronRight,
  Printer
} from 'lucide-react';
import { store } from '@/lib/store/security-store';
import { Severity, FindingStatus } from '@/types/security';

export default function AuditReportPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const audit = store.getAuditById(resolvedParams.id);
  const project = audit ? store.getProjectById(audit.projectId) : undefined;

  const [severityFilter, setSeverityFilter] = useState<'ALL' | Severity>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | FindingStatus>('ALL');
  const [stakeholderMode, setStakeholderMode] = useState(false);

  // Status Modal State
  const [editingFindingId, setEditingFindingId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<FindingStatus>('FIXED');
  const [justification, setJustification] = useState('');

  if (!audit) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-4">
        <ShieldAlert className="w-10 h-10 mx-auto text-slate-500" />
        <p className="text-base font-semibold">Relatório de auditoria não encontrado.</p>
        <Link href="/dashboard" className="text-cyan-400 hover:underline text-xs">
          Voltar ao Dashboard
        </Link>
      </div>
    );
  }

  const handleUpdateFindingStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFindingId) return;

    store.updateFindingStatus(audit.id, editingFindingId, newStatus, justification);
    setEditingFindingId(null);
    setJustification('');
  };

  const filteredFindings = audit.findings.filter(f => {
    if (severityFilter !== 'ALL' && f.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && f.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Top Header & Back Navigation */}
      <div className="space-y-4">
        <Link 
          href={`/dashboard/project/${audit.projectId}`}
          className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Projeto {project?.name || ''}</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-white">Relatório Executivo de Auditoria</h1>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                {audit.id}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Executado em {new Date(audit.createdAt).toLocaleString('pt-PT')} • {audit.filesAnalyzedCount} arquivos analisados ({audit.codeSizeKB} KB)
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {/* Stakeholder Mode Toggle */}
            <button
              onClick={() => setStakeholderMode(!stakeholderMode)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-2 border ${
                stakeholderMode 
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' 
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {stakeholderMode ? <EyeOff className="w-4 h-4 text-purple-400" /> : <Eye className="w-4 h-4" />}
              <span>{stakeholderMode ? 'Modo Executivo Ativo' : 'Modo Técnico'}</span>
            </button>

            {/* View Blueprint Button */}
            <Link
              href={`/dashboard/audit/${audit.id}/blueprint`}
              className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Ver Blueprint de Correção</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Production Readiness Warning Banner */}
      {!audit.productionReady && (
        <div className="p-4 bg-rose-950/60 border border-rose-800/80 rounded-2xl flex items-start space-x-3 text-rose-200">
          <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-rose-300">DEPLOY BLOQUEADO PARA PRODUÇÃO</h4>
            <p className="text-xs text-rose-200/90 leading-relaxed">
              Existem {audit.totalCritical} vulnerabilidade(s) com severidade CRÍTICO em aberto. De acordo com as regras de conformidade da plataforma, o projeto não pode ser considerado &quot;Pronto para Produção&quot; até que todas as falhas críticas sejam corrigidas e re-auditadas.
            </p>
          </div>
        </div>
      )}

      {/* Security Score Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Main Score Box */}
        <div className="md:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="space-y-2">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Score de Segurança</div>
            <div className={`text-4xl font-black ${
              audit.score >= 85 ? 'text-emerald-400' : audit.score >= 70 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {audit.score} <span className="text-lg font-medium text-slate-500">/ 100</span>
            </div>

            <div>
              {audit.verdict === 'APROVADO_COM_DISTINCAO' && (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950 border border-emerald-800 text-emerald-400">
                  APROVADO COM DISTINÇÃO
                </span>
              )}
              {audit.verdict === 'APROVADO_COM_RESSALVAS' && (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-950 border border-amber-800 text-amber-400">
                  APROVADO COM RESSALVAS
                </span>
              )}
              {audit.verdict === 'APROVADO_CONDICIONALMENTE' && (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-yellow-950 border border-yellow-800 text-yellow-400">
                  APROVADO CONDICIONALMENTE
                </span>
              )}
              {audit.verdict === 'REPROVADO' && (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-950 border border-rose-800 text-rose-400">
                  REPROVADO — NÃO APTO
                </span>
              )}
            </div>
          </div>

          <div className="w-24 h-24 rounded-full border-4 border-slate-800 flex items-center justify-center relative">
            <div className="text-center">
              <div className="text-xs font-mono text-slate-400">Desconto</div>
              <div className="text-sm font-bold text-rose-400">-{100 - audit.score} pts</div>
            </div>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="text-xs font-mono text-slate-400 uppercase">Resumo por Severidade</div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center">
              <span className="text-rose-400 font-bold">● CRÍTICO (-25pts)</span>
              <span className="font-bold text-white">{audit.totalCritical}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-amber-400 font-bold">● ALTO (-10pts)</span>
              <span className="font-bold text-white">{audit.totalHigh}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-yellow-400 font-bold">● MÉDIO (-5pts)</span>
              <span className="font-bold text-white">{audit.totalMedium}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase">Submetido Por</div>
            <div className="text-sm font-bold text-slate-200 mt-1">{audit.submittedBy}</div>
            <div className="text-[11px] text-slate-500 mt-1 font-mono">{audit.sourceType} • {audit.sourceDetails}</div>
          </div>

          <Link
            href={`/dashboard/audit/${audit.id}/blueprint`}
            className="text-xs font-semibold text-cyan-400 hover:underline flex items-center space-x-1 mt-4"
          >
            <span>Gerar documento em PDF</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Findings Section & Filters */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden space-y-4">
        {/* Filter Controls Header */}
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white">Vulnerabilidades Identificadas ({audit.findings.length})</h2>
            <p className="text-xs text-slate-400">
              {stakeholderMode ? 'Exibição em modo executivo resumido sem trechos de código técnicos.' : 'Visão detalhada com localização no código e prova técnica.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Severity Filter */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-mono">
              <button
                onClick={() => setSeverityFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg ${severityFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
              >
                Todas
              </button>
              <button
                onClick={() => setSeverityFilter('CRITICAL')}
                className={`px-2.5 py-1 rounded-lg ${severityFilter === 'CRITICAL' ? 'bg-rose-950 text-rose-300 font-bold' : 'text-slate-400'}`}
              >
                Crítico
              </button>
              <button
                onClick={() => setSeverityFilter('HIGH')}
                className={`px-2.5 py-1 rounded-lg ${severityFilter === 'HIGH' ? 'bg-amber-950 text-amber-300 font-bold' : 'text-slate-400'}`}
              >
                Alto
              </button>
              <button
                onClick={() => setSeverityFilter('MEDIUM')}
                className={`px-2.5 py-1 rounded-lg ${severityFilter === 'MEDIUM' ? 'bg-yellow-950 text-yellow-300 font-bold' : 'text-slate-400'}`}
              >
                Médio
              </button>
            </div>

            {/* Status Filter */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-mono">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg ${statusFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setStatusFilter('OPEN')}
                className={`px-2.5 py-1 rounded-lg ${statusFilter === 'OPEN' ? 'bg-rose-950 text-rose-300' : 'text-slate-400'}`}
              >
                Em Aberto
              </button>
              <button
                onClick={() => setStatusFilter('FIXED')}
                className={`px-2.5 py-1 rounded-lg ${statusFilter === 'FIXED' ? 'bg-emerald-950 text-emerald-300' : 'text-slate-400'}`}
              >
                Corrigidas
              </button>
            </div>
          </div>
        </div>

        {/* Findings List */}
        <div className="p-5 space-y-6">
          {filteredFindings.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-mono text-xs">
              Nenhuma vulnerabilidade com os filtros selecionados.
            </div>
          ) : (
            filteredFindings.map((finding) => (
              <div 
                key={finding.id}
                className={`p-5 rounded-2xl border space-y-4 transition-all ${
                  finding.status === 'FIXED'
                    ? 'bg-slate-950/50 border-slate-800/80 opacity-75'
                    : finding.severity === 'CRITICAL'
                    ? 'bg-rose-950/10 border-rose-900/60'
                    : finding.severity === 'HIGH'
                    ? 'bg-amber-950/10 border-amber-900/60'
                    : 'bg-yellow-950/10 border-yellow-900/60'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center space-x-3">
                    {/* Severity Badge */}
                    <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                      finding.severity === 'CRITICAL' ? 'bg-rose-950 border border-rose-800 text-rose-400' :
                      finding.severity === 'HIGH' ? 'bg-amber-950 border border-amber-800 text-amber-400' :
                      'bg-yellow-950 border border-yellow-800 text-yellow-400'
                    }`}>
                      {finding.severity}
                    </span>

                    <span className="font-mono text-xs font-bold text-slate-400">
                      [{finding.ruleId}] {finding.ruleName}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Finding Status Badge */}
                    {finding.status === 'FIXED' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Corrigido</span>
                      </span>
                    )}
                    {finding.status === 'IGNORED' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 border border-slate-700 text-slate-400">
                        Ignorado
                      </span>
                    )}
                    {finding.status === 'OPEN' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-950 border border-rose-800 text-rose-400">
                        Em Aberto
                      </span>
                    )}

                    <button
                      onClick={() => {
                        setEditingFindingId(finding.id);
                        setNewStatus(finding.status === 'OPEN' ? 'FIXED' : 'OPEN');
                      }}
                      className="text-xs text-cyan-400 hover:underline font-mono"
                    >
                      Alterar Estado
                    </button>
                  </div>
                </div>

                {/* Location */}
                <div className="text-xs font-mono text-slate-400">
                  Localização: <span className="text-slate-200 font-bold">{finding.location}</span>
                </div>

                {/* Description & Impact */}
                <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                  <p><strong className="text-white">Descrição:</strong> {finding.description}</p>
                  <p><strong className="text-rose-400">Por que é explorável:</strong> {finding.exploitationReason}</p>
                  <p><strong className="text-amber-400">Impacto potencial:</strong> {finding.potentialImpact}</p>
                </div>

                {/* Code Proof Box (Hidden in Stakeholder Mode) */}
                {!stakeholderMode && finding.codeProof && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Prova em Código (Vulnerável):</div>
                    <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-rose-300 overflow-x-auto">
                      {finding.codeProof}
                    </pre>
                  </div>
                )}

                {/* Status Justification note if any */}
                {finding.statusJustification && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 italic font-mono">
                    Justificação da equipa ({finding.fixedAt ? new Date(finding.fixedAt).toLocaleDateString() : ''}): {finding.statusJustification}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal for Editing Finding Status */}
      {editingFindingId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white">Alterar Estado da Vulnerabilidade</h3>
              <button onClick={() => setEditingFindingId(null)} className="text-slate-500 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleUpdateFindingStatus} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">Selecione o novo estado:</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as FindingStatus)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                >
                  <option value="FIXED">Marcado como Corrigido</option>
                  <option value="IGNORED">Ignorado (Aceitação de Risco / Falso Positivo)</option>
                  <option value="OPEN">Em Aberto (Ativo)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">Justificação / Nota da Equipa</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explique porque a falha foi corrigida ou por que foi ignorada..."
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingFindingId(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold rounded-xl shadow"
                >
                  Guardar Estado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
