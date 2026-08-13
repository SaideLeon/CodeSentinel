"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  ArrowRight, 
  ExternalLink,
  Receipt,
  Check
} from 'lucide-react';
import { store } from '@/lib/store/security-store';

export default function BillingPage() {
  const [sub, setSub] = useState(store.getSubscription());
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState('');

  const plans = [
    {
      id: 'FREE' as const,
      name: 'Gratuito',
      price: '0 €',
      period: '/mês',
      credits: 2,
      features: [
        '2 auditorias por mês',
        'Análise de até 50KB de código',
        'Relatórios executivos',
        'Regras OWASP essenciais',
      ],
      current: sub.plan === 'FREE'
    },
    {
      id: 'PRO' as const,
      name: 'Pro Developer',
      price: '49 €',
      period: '/mês',
      credits: 50,
      popular: true,
      features: [
        '50 auditorias por mês',
        'Análise de até 500KB por execução',
        'Importação direta de repositórios GitHub',
        'Geração de Security Blueprint (.md & PDF)',
        'Suporte prioritário via e-mail',
        'Suporte a Race Conditions & CTF-rules'
      ],
      current: sub.plan === 'PRO'
    },
    {
      id: 'TEAM' as const,
      name: 'Equipa & Agência',
      price: '199 €',
      period: '/mês',
      credits: 300,
      features: [
        '300 auditorias por mês',
        'Até 10 membros de equipa inclusos',
        'Acesso ao Painel Admin de Regras Personalizadas',
        'Análise ilimitada de código',
        'Inclusão de testes automatizados de validação',
        'Gestor de conta dedicado'
      ],
      current: sub.plan === 'TEAM'
    }
  ];

  const handleSelectPlan = (planId: 'FREE' | 'PRO' | 'TEAM') => {
    setIsUpgrading(true);
    setTimeout(() => {
      const updated = store.updateSubscriptionPlan(planId);
      setSub(updated);
      setIsUpgrading(false);
      setUpgradeSuccess(`Plano atualizado com sucesso para ${planId}! Seus créditos foram renovados.`);
    }, 1000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
          <CreditCard className="w-6 h-6 text-cyan-400" />
          <span>Plano & Faturação</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Gerir a sua subscrição, limites de créditos de auditoria e faturas.
        </p>
      </div>

      {upgradeSuccess && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold rounded-2xl flex items-center justify-between">
          <span>{upgradeSuccess}</span>
          <button onClick={() => setUpgradeSuccess('')} className="text-emerald-400 font-bold">✕</button>
        </div>
      )}

      {/* Current Usage Widget */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase">Subscrição Atual</div>
            <div className="text-xl font-bold text-white mt-0.5 flex items-center space-x-2">
              <span>Plano {sub.plan}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 font-mono">
                Ativo
              </span>
            </div>
          </div>

          <button 
            onClick={() => handleSelectPlan('PRO')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors border border-slate-700 self-start sm:self-auto"
          >
            Portal de Pagamentos Stripe
          </button>
        </div>

        {/* Progress bar */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400">Consumo de Créditos de Auditoria</span>
            <span className="text-cyan-400 font-bold">{sub.creditsUsed} de {sub.creditsLimit} utilizados</span>
          </div>
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (sub.creditsUsed / sub.creditsLimit) * 100)}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Renovação automática do saldo em 01/09/2026.
          </div>
        </div>
      </div>

      {/* Plans Comparison */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Escolha o Plano Ideal para a sua Equipa</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div 
              key={p.id}
              className={`p-6 rounded-2xl border flex flex-col justify-between space-y-6 relative transition-all ${
                p.popular 
                  ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-cyan-950/30 border-cyan-500/50 shadow-xl shadow-cyan-500/10' 
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-cyan-400 text-slate-950 text-[10px] font-mono font-bold rounded-full uppercase tracking-wider">
                  Mais Popular
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{p.name}</h3>
                  <div className="mt-2 flex items-baseline space-x-1">
                    <span className="text-3xl font-extrabold text-white">{p.price}</span>
                    <span className="text-xs text-slate-400 font-mono">{p.period}</span>
                  </div>
                  <p className="text-xs text-cyan-400 font-mono mt-2 font-semibold">
                    {p.credits} auditorias / mês
                  </p>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-slate-800/80">
                  {p.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start space-x-2 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                disabled={p.current || isUpgrading}
                onClick={() => handleSelectPlan(p.id)}
                className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-2 ${
                  p.current
                    ? 'bg-slate-800 text-slate-500 cursor-default border border-slate-700'
                    : p.popular
                    ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                {p.current ? (
                  <span>Plano Atual</span>
                ) : (
                  <>
                    <span>{isUpgrading ? 'A processar...' : 'Mudar para este plano'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden space-y-2">
        <div className="p-5 border-b border-slate-800">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-cyan-400" />
            <span>Histórico de Pagamentos & Faturas</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="p-4">Fatura</th>
                <th className="p-4">Data</th>
                <th className="p-4">Valor</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="p-4 font-bold text-slate-200">INV-2026-001</td>
                <td className="p-4 text-slate-400">01/08/2026</td>
                <td className="p-4 text-slate-200">49,00 €</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold">
                    Pago
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="text-cyan-400 hover:underline flex items-center space-x-1 justify-end ml-auto">
                    <span>PDF</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
