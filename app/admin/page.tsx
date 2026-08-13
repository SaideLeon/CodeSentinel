"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sliders, 
  ShieldCheck, 
  Users, 
  Activity, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle2, 
  Power, 
  ArrowLeft,
  Settings,
  Database
} from 'lucide-react';
import { store } from '@/lib/store/security-store';
import { SecurityRule, Severity } from '@/types/security';

export default function AdminDashboardPage() {
  const [rules, setRules] = useState<SecurityRule[]>(store.getSecurityRules());
  const [activeTab, setActiveTab] = useState<'rules' | 'users' | 'logs'>('rules');

  const handleToggleRule = (ruleId: string) => {
    store.toggleRuleEnabled(ruleId);
    setRules([...store.getSecurityRules()]);
  };

  const handleSeverityChange = (ruleId: string, severity: Severity) => {
    store.updateRuleSeverity(ruleId, severity);
    setRules([...store.getSecurityRules()]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Back Link & Header */}
      <div className="space-y-4">
        <Link 
          href="/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Dashboard de Cliente</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Sliders className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Painel de Administração da Plataforma</h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Gestão central de regras de segurança, parâmetros do motor estático e estatísticas globais do SecAudit Pro.
            </p>
          </div>

          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors ${
                activeTab === 'rules' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Catálogo de Regras
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors ${
                activeTab === 'users' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Gestão de Clientes
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors ${
                activeTab === 'logs' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Logs de Execução
            </button>
          </div>
        </div>
      </div>

      {/* Global Platform KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-xs font-mono text-slate-400 uppercase">MRR (Receita Mensal)</div>
          <div className="text-2xl font-black text-emerald-400">14.850 €</div>
          <div className="text-[10px] text-slate-500">+18% em relação ao mês anterior</div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-xs font-mono text-slate-400 uppercase">Auditorias Executadas (30d)</div>
          <div className="text-2xl font-black text-cyan-400">1.420</div>
          <div className="text-[10px] text-slate-500">Média de 47 auditorias por dia</div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-xs font-mono text-slate-400 uppercase">Regras de Segurança Ativas</div>
          <div className="text-2xl font-black text-purple-400">
            {rules.filter(r => r.enabled).length} / {rules.length}
          </div>
          <div className="text-[10px] text-slate-500">Motor de verificação estático v2.4</div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-xs font-mono text-slate-400 uppercase">Tempo Médio de Análise</div>
          <div className="text-2xl font-black text-amber-400">420ms</div>
          <div className="text-[10px] text-slate-500">Sub-segundo sem latência de IA</div>
        </div>
      </div>

      {/* TAB 1: Rules Management */}
      {activeTab === 'rules' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden space-y-2">
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white">Catálogo Dinâmico de Regras de Segurança</h2>
              <p className="text-xs text-slate-400">
                Ative ou desative verificações e ajuste os níveis de penalização no score global sem alterar o código do sistema.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                <tr>
                  <th className="p-4">ID & Regra</th>
                  <th className="p-4">Categoria</th>
                  <th className="p-4">Severidade</th>
                  <th className="p-4">Penalização</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-slate-200">
                      <div className="text-white font-bold">{rule.id}: {rule.name}</div>
                      <div className="text-[11px] text-slate-400 font-normal mt-0.5 line-clamp-1">{rule.description}</div>
                    </td>

                    <td className="p-4 text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                        {rule.category}
                      </span>
                    </td>

                    <td className="p-4">
                      <select
                        value={rule.severity}
                        onChange={(e) => handleSeverityChange(rule.id, e.target.value as Severity)}
                        className="bg-slate-950 border border-slate-800 text-xs rounded px-2 py-1 text-slate-200 focus:outline-none"
                      >
                        <option value="CRITICAL">CRITICAL</option>
                        <option value="HIGH">HIGH</option>
                        <option value="MEDIUM">MEDIUM</option>
                      </select>
                    </td>

                    <td className="p-4 text-rose-400 font-bold">
                      -{rule.penaltyPoints} pts
                    </td>

                    <td className="p-4">
                      {rule.enabled ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 border border-emerald-800 text-emerald-400">
                          Ativa
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-500">
                          Inativa
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleRule(rule.id)}
                        className={`p-2 rounded-lg text-xs font-bold transition-colors ${
                          rule.enabled 
                            ? 'bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800' 
                            : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5 inline mr-1" />
                        <span>{rule.enabled ? 'Desativar' : 'Ativar'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Users Management */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
          <h2 className="text-base font-bold text-white">Clientes Registados na Plataforma</h2>
          <div className="divide-y divide-slate-800/80">
            <div className="py-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">Alexandre Silva</div>
                <div className="text-xs text-slate-400 font-mono">alexandre@secaudit.io • NovaTech Studio</div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-2.5 py-1 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 text-xs font-mono font-bold">
                  Plano PRO
                </span>
                <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg text-slate-300">
                  Gerir Plano
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Execution Logs */}
      {activeTab === 'logs' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
          <h2 className="text-base font-bold text-white">Logs de Execução do Motor de Segurança</h2>
          <div className="space-y-2 font-mono text-xs text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="text-emerald-400">[INFO 10:28:12] Audit AUD-8210 completed. Duration: 340ms. Status: 200 OK.</div>
            <div className="text-emerald-400">[INFO 10:15:00] Rule engine synced 10 rule definitions. Cache updated.</div>
            <div className="text-amber-400">[WARN 09:50:22] Project PROJ-2 flagged with 2 CRITICAL findings. Deploy BLOCKED.</div>
          </div>
        </div>
      )}
    </div>
  );
}
