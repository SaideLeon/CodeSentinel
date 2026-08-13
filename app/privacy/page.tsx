import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 sm:p-12 max-w-4xl mx-auto space-y-8">
      <Link href="/" className="inline-flex items-center space-x-2 text-xs text-slate-400 hover:text-cyan-400 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar à Página Inicial</span>
      </Link>

      <div className="space-y-3 border-b border-slate-800 pb-6">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-8 h-8 text-cyan-400" />
          <h1 className="text-3xl font-extrabold text-white">Política de Privacidade & Proteção de Dados (RGPD)</h1>
        </div>
        <p className="text-xs font-mono text-slate-400">Última atualização: 13 de Agosto de 2026</p>
      </div>

      <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">1. Recolha de Dados Pessoais</h2>
          <p>
            Recolhemos apenas os dados estritamente necessários para a prestação do serviço: nome, endereço de e-mail corporativo, informações de faturação e dados técnicos de autenticação OAuth (caso utilize o login via GitHub).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">2. Processamento do Código-Fonte</h2>
          <p>
            Os trechos de código submetidos para análise são processados em servidores seguros com encriptação em trânsito (TLS 1.3) e em repouso (AES-256). O código é eliminado do ambiente de execução efémero imediatamente após a conclusão do relatório.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">3. Direitos do Titular dos Dados</h2>
          <p>
            Nos termos do RGPD, o utilizador tem o direito de solicitar o acesso, retificação ou eliminação definitiva dos seus dados pessoais e histórico de auditorias a qualquer momento através de contato direto com o nosso encarregado de proteção de dados.
          </p>
        </section>
      </div>
    </div>
  );
}
