import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 sm:p-12 max-w-4xl mx-auto space-y-8">
      <Link href="/" className="inline-flex items-center space-x-2 text-xs text-slate-400 hover:text-cyan-400 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar à Página Inicial</span>
      </Link>

      <div className="space-y-3 border-b border-slate-800 pb-6">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-8 h-8 text-cyan-400" />
          <h1 className="text-3xl font-extrabold text-white">Termos de Serviço</h1>
        </div>
        <p className="text-xs font-mono text-slate-400">Última atualização: 13 de Agosto de 2026</p>
      </div>

      <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">1. Visão Geral da Plataforma</h2>
          <p>
            O SecAudit Pro é uma solução SaaS destinada à análise automatizada de código-fonte para identificação de vulnerabilidades de segurança, falhas de lógica de negócios e verificação de conformidade de código.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">2. Propriedade Intelectual & Confidencialidade do Código</h2>
          <p>
            O utilizador mantém a propriedade exclusiva sobre todo o código-fonte submetido para auditoria. O SecAudit Pro processa o código de forma efémera em memória isolada e não utiliza o seu código para treino de modelos ou comercialização a terceiros.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">3. Limites de Responsabilidade</h2>
          <p>
            Embora as regras de verificação do SecAudit Pro sejam continuamente atualizadas de acordo com os padrões OWASP e estudos de vulnerabilidades, a aprovação de uma auditoria não substitui testes de penetração manuais contínuos nem garante imunidade absoluta contra novos vetores de ataque desconhecidos (Zero-Day).
          </p>
        </section>
      </div>
    </div>
  );
}
