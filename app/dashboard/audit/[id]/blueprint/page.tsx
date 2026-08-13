"use client";

import React, { use } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Download, 
  Printer, 
  Copy, 
  CheckCircle2, 
  Code2, 
  Terminal, 
  Check, 
  Layers, 
  ShieldAlert,
  FileText
} from 'lucide-react';
import { store } from '@/lib/store/security-store';

export default function SecurityBlueprintPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  const audit = store.getAuditById(resolvedParams.id);
  const project = audit ? store.getProjectById(audit.projectId) : undefined;

  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  if (!audit) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-4 font-sans">
        <p className="text-base font-semibold">Blueprint não encontrado.</p>
        <Link href="/dashboard" className="text-cyan-400 hover:underline text-xs">
          Voltar ao Dashboard
        </Link>
      </div>
    );
  }

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateMarkdownBlueprint = () => {
    let md = `# BLUEPRINT DE CORREÇÃO DE SEGURANÇA (SECURITY BLUEPRINT)\n\n`;
    md += `**Projeto:** ${project?.name || 'N/A'}\n`;
    md += `**Audit ID:** ${audit.id}\n`;
    md += `**Data:** ${new Date(audit.createdAt).toLocaleString()}\n`;
    md += `**Score de Segurança:** ${audit.score}/100\n`;
    md += `**Veredito:** ${audit.verdict}\n\n`;

    md += `---\n\n## 1. RESUMO EXECUTIVO\n\n`;
    md += `A auditoria automática identificou ${audit.findings.length} vulnerabilidade(s) no código-fonte submetido.\n`;
    md += `- **Críticos:** ${audit.totalCritical}\n`;
    md += `- **Altos:** ${audit.totalHigh}\n`;
    md += `- **Médios:** ${audit.totalMedium}\n\n`;

    md += `---\n\n## 2. PLANO DE REMEDIAÇÃO PASSO A PASSO\n\n`;

    audit.findings.forEach((f, idx) => {
      md += `### Vulnerabilidade ${idx + 1}: [${f.ruleId}] ${f.ruleName} (${f.severity})\n`;
      md += `- **Localização:** \`${f.location}\`\n`;
      md += `- **Impacto:** ${f.potentialImpact}\n`;
      md += `- **Razão de Exploração:** ${f.exploitationReason}\n\n`;

      md += `#### Arquitetura Recomendada:\n\`\`\`\n${f.fixArchitecture || 'N/A'}\n\`\`\`\n\n`;

      md += `#### Passos de Correção:\n`;
      f.fixSteps.forEach((step, sIdx) => {
        md += `##### ${sIdx + 1}. ${step.title}\n`;
        md += `${step.description}\n\n`;
        md += `\`\`\`${step.language}\n${step.code}\n\`\`\`\n\n`;
      });

      if (f.validationTest) {
        md += `#### Teste de Validação Automatizado:\n`;
        md += `**Comando de Execução:** \`${f.validationTest.command}\`\n\n`;
        md += `\`\`\`${f.validationTest.language}\n${f.validationTest.code}\n\`\`\`\n\n`;
        md += `**Resultado Esperado:** ${f.validationTest.expectedResult}\n\n`;
      }

      if (f.deployChecklist && f.deployChecklist.length > 0) {
        md += `#### Checklist de Deploy:\n`;
        f.deployChecklist.forEach(item => {
          md += `- [ ] ${item}\n`;
        });
        md += `\n`;
      }

      md += `---\n\n`;
    });

    return md;
  };

  const handleDownloadMarkdown = () => {
    const mdContent = generateMarkdownBlueprint();
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Security_Blueprint_${audit.id}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-8 print:bg-white print:text-slate-900">
      {/* Action Header - Hidden on Print */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 print:hidden">
        <Link 
          href={`/dashboard/audit/${audit.id}`}
          className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Relatório da Auditoria</span>
        </Link>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadMarkdown}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center space-x-2 border border-slate-700"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Descarregar Markdown (.md)</span>
          </button>

          <button
            onClick={handlePrintPdf}
            className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-cyan-500/20 transition-all flex items-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* Formatted Document Canvas */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-10 shadow-2xl print:border-none print:shadow-none print:p-0 print:bg-white print:text-slate-900">
        {/* Document Title Header */}
        <div className="border-b border-slate-800 pb-8 space-y-4 print:border-slate-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-white print:text-slate-900">BLUEPRINT DE CORREÇÃO DE SEGURANÇA</h1>
                <p className="text-xs font-mono text-cyan-400">SecAudit Pro • Documento Técnico de Remediação</p>
              </div>
            </div>

            <div className="text-right text-xs font-mono text-slate-400 print:text-slate-600">
              <div>Audit ID: {audit.id}</div>
              <div>Emissão: {new Date(audit.createdAt).toLocaleDateString('pt-PT')}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs font-mono">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 print:bg-slate-100 print:border-slate-300">
              <div className="text-[10px] text-slate-500">Projeto</div>
              <div className="font-bold text-white print:text-slate-900">{project?.name || 'Projeto'}</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 print:bg-slate-100 print:border-slate-300">
              <div className="text-[10px] text-slate-500">Score de Segurança</div>
              <div className="font-bold text-cyan-400">{audit.score} / 100</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 print:bg-slate-100 print:border-slate-300">
              <div className="text-[10px] text-slate-500">Estado de Deploy</div>
              <div className={`font-bold ${audit.productionReady ? 'text-emerald-400' : 'text-rose-400'}`}>
                {audit.productionReady ? 'Aprovado' : 'Bloqueado'}
              </div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 print:bg-slate-100 print:border-slate-300">
              <div className="text-[10px] text-slate-500">Total Vulnerabilidades</div>
              <div className="font-bold text-slate-200 print:text-slate-900">{audit.findings.length} identificadas</div>
            </div>
          </div>
        </div>

        {/* Section 1: Executive Overview */}
        <section className="space-y-3">
          <h2 className="text-base font-mono font-bold text-cyan-400 uppercase tracking-wider print:text-cyan-700">
            1. Resumo Executivo & Diagnóstico
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed print:text-slate-800">
            Este documento contém as diretrizes técnicas passo a passo para remediação das vulnerabilidades encontradas na verificação. O plano foi desenhado para eliminar falhas de classe OWASP e restaurar a conformidade técnica exigida para disponibilização em produção.
          </p>
        </section>

        {/* Section 2: Step-by-Step Remediation */}
        <section className="space-y-8">
          <h2 className="text-base font-mono font-bold text-cyan-400 uppercase tracking-wider print:text-cyan-700">
            2. Guia de Correção & Testes por Vulnerabilidade
          </h2>

          {audit.findings.map((finding, idx) => (
            <div key={finding.id} className="p-6 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-6 print:bg-slate-50 print:border-slate-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 print:border-slate-300">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm font-bold text-white print:text-slate-900">
                    {idx + 1}. [{finding.ruleId}] {finding.ruleName}
                  </span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                  finding.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                  finding.severity === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                  'bg-yellow-950 text-yellow-400 border border-yellow-800'
                }`}>
                  {finding.severity}
                </span>
              </div>

              {/* Vulnerability Meta */}
              <div className="text-xs space-y-1 font-mono text-slate-400 print:text-slate-700">
                <div><strong className="text-slate-300">Localização:</strong> {finding.location}</div>
                <div><strong className="text-slate-300">Razão do Risco:</strong> {finding.exploitationReason}</div>
              </div>

              {/* Architecture Diagram Box */}
              {finding.fixArchitecture && (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Arquitetura de Segurança Aplicada:</div>
                  <pre className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto whitespace-pre print:bg-white print:border-slate-300 print:text-slate-800">
                    {finding.fixArchitecture}
                  </pre>
                </div>
              )}

              {/* Steps */}
              <div className="space-y-4">
                <div className="text-xs font-bold text-white font-mono uppercase print:text-slate-900">Passos de Código para Solução:</div>
                {finding.fixSteps.map((step, sIdx) => (
                  <div key={sIdx} className="space-y-2">
                    <div className="text-xs font-semibold text-cyan-300 print:text-cyan-800">
                      {sIdx + 1}. {step.title}
                    </div>
                    <p className="text-xs text-slate-400 print:text-slate-700">{step.description}</p>

                    <div className="relative">
                      <pre className="p-4 bg-slate-900 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto print:bg-white print:border-slate-300 print:text-slate-900">
                        {step.code}
                      </pre>
                      <button
                        onClick={() => handleCopyCode(step.code, `step_${idx}_${sIdx}`)}
                        className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors print:hidden"
                        title="Copiar código"
                      >
                        {copiedId === `step_${idx}_${sIdx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Validation Test */}
              {finding.validationTest && (
                <div className="space-y-2 pt-2 border-t border-slate-800/80 print:border-slate-300">
                  <div className="text-xs font-bold text-purple-400 font-mono uppercase flex items-center justify-between">
                    <span>Teste Automatizado de Validação ({finding.validationTest.language})</span>
                    <span className="text-[10px] font-normal text-slate-400">{finding.validationTest.command}</span>
                  </div>

                  <pre className="p-4 bg-slate-900 rounded-xl border border-slate-800 font-mono text-xs text-purple-300 overflow-x-auto print:bg-white print:border-slate-300 print:text-slate-900">
                    {finding.validationTest.code}
                  </pre>

                  <div className="text-[11px] font-mono text-slate-400">
                    Resultado Esperado: <span className="text-emerald-400 font-bold">{finding.validationTest.expectedResult}</span>
                  </div>
                </div>
              )}

              {/* Deploy Checklist */}
              {finding.deployChecklist && finding.deployChecklist.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800/80 print:border-slate-300">
                  <div className="text-xs font-bold text-amber-400 font-mono uppercase">Checklist de Verificação de Deploy:</div>
                  <ul className="space-y-1 text-xs text-slate-300 font-mono">
                    {finding.deployChecklist.map((chk, cIdx) => (
                      <li key={cIdx} className="flex items-start space-x-2">
                        <span className="text-cyan-400">☐</span>
                        <span>{chk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Footer */}
        <div className="pt-8 border-t border-slate-800 text-center text-xs font-mono text-slate-500 print:border-slate-300">
          Relatório gerado automaticamente por SecAudit Pro • Guarde este documento para fins de compliance e auditoria externa.
        </div>
      </div>
    </div>
  );
}
