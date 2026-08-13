"use client";

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Check, ArrowRight, ArrowLeft } from 'lucide-react';

export default function PublicPricingPage() {
  const plans = [
    {
      name: 'Gratuito',
      price: '0 €',
      period: '/mês',
      credits: '2 auditorias/mês',
      description: 'Ideal para testar o motor de verificação de segurança em projetos pessoais.',
      features: [
        '2 auditorias por mês',
        'Análise estática OWASP',
        'Relatório resumido',
        'Verificação de SQL Injection & Secrets'
      ],
      cta: 'Começar Grátis',
      href: '/register',
      popular: false
    },
    {
      name: 'Pro Developer',
      price: '49 €',
      period: '/mês',
      credits: '50 auditorias/mês',
      description: 'Para programadores e freelancers que constroem e lançam software em produção.',
      features: [
        '50 auditorias por mês',
        'Análise de repositórios GitHub',
        'Geração de Security Blueprint (.md & PDF)',
        'Suporte a Race Conditions & Leitura Fora de Transação',
        'Suporte prioritário por e-mail'
      ],
      cta: 'Criar Conta Pro',
      href: '/register',
      popular: true
    },
    {
      name: 'Equipa & Agência',
      price: '199 €',
      period: '/mês',
      credits: '300 auditorias/mês',
      description: 'Para equipas de engenharia e agências de desenvolvimento de software.',
      features: [
        '300 auditorias por mês',
        'Até 10 membros de equipa',
        'Acesso ao painel admin de regras',
        'Inclusão de testes automatizados de validação',
        'Relatórios de auditoria com marca própria'
      ],
      cta: 'Criar Conta de Equipa',
      href: '/register',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 sm:p-12 max-w-6xl mx-auto space-y-12">
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <Link href="/" className="inline-flex items-center space-x-2 text-xs text-slate-400 hover:text-cyan-400 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar à Página Inicial</span>
        </Link>

        <Link href="/login" className="text-xs font-mono font-semibold text-cyan-400 hover:underline">
          Já tem conta? Entrar
        </Link>
      </div>

      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Planos Transparentes para Equipa e Desenvolvedores
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          Sem contratos de fidelização. Escolha a quantidade de auditorias necessárias para garantir o deploy seguro das suas aplicações.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p, idx) => (
          <div 
            key={idx}
            className={`p-8 rounded-2xl border flex flex-col justify-between space-y-6 relative transition-all ${
              p.popular 
                ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-cyan-950/30 border-cyan-500/50 shadow-2xl shadow-cyan-500/10' 
                : 'bg-slate-900 border-slate-800'
            }`}
          >
            {p.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-cyan-400 text-slate-950 text-[10px] font-mono font-bold rounded-full uppercase tracking-wider">
                Mais Recomendado
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white">{p.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{p.description}</p>
              </div>

              <div className="flex items-baseline space-x-1 border-t border-b border-slate-800/80 py-4">
                <span className="text-4xl font-extrabold text-white">{p.price}</span>
                <span className="text-xs text-slate-400 font-mono">{p.period}</span>
                <span className="text-xs font-mono text-cyan-400 font-bold ml-auto">{p.credits}</span>
              </div>

              <div className="space-y-3 pt-2">
                {p.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-start space-x-2.5 text-xs text-slate-300">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href={p.href}
              className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-2 ${
                p.popular
                  ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <span>{p.cta}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
