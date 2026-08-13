"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, 
  ShieldCheck, 
  FolderPlus, 
  CheckCircle2, 
  XCircle, 
  ArrowUpRight, 
  Clock, 
  GitBranch, 
  Code2, 
  AlertTriangle,
  BarChart2,
  Lock,
  Layers,
  Sparkles,
  Search,
  ExternalLink
} from 'lucide-react';
import { store } from '@/lib/store/security-store';
import { Project } from '@/types/security';

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(store.getProjects());
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Project Form State
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [repoUrl, setRepoUrl] = useState('');

  const sub = store.getSubscription();

  // Metrics calculation
  const totalProjects = projects.length;
  const avgScore = projects.length > 0 
    ? Math.round(projects.reduce((acc, p) => acc + (p.latestScore || 0), 0) / projects.length)
    : 0;
  const openCriticalsCount = projects.filter(p => p.hasOpenCritical).length;
  const productionReadyCount = projects.filter(p => p.productionReady).length;

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    const newProj = store.createProject(projectName, projectDesc, repoUrl || undefined);
    setProjects(store.getProjects());
    setIsModalOpen(false);
    setProjectName('');
    setProjectDesc('');
    setRepoUrl('');

    // Redirect to project detail to perform first audit
    router.push(`/dashboard/project/${newProj.id}`);
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <span>Visão Geral do Portfólio</span>
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
              {sub.plan} Plan
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Acompanhe o score de segurança e estado de conformidade técnica dos seus repositórios.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl shadow-md shadow-cyan-500/20 text-sm transition-all flex items-center space-x-2 shrink-0"
        >
          <FolderPlus className="w-4 h-4 stroke-[2.5]" />
          <span>Criar Novo Projeto</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Total de Projetos</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{totalProjects}</div>
          <div className="text-[11px] text-slate-500">Repositórios ativos na conta</div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Score Médio de Segurança</span>
            <BarChart2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className={`text-3xl font-extrabold ${avgScore >= 85 ? 'text-emerald-400' : avgScore >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>
            {avgScore} <span className="text-sm font-normal text-slate-500">/ 100</span>
          </div>
          <div className="text-[11px] text-slate-500">Média ponderada entre projetos</div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Projetos C/ Falhas Críticas</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold text-rose-400">{openCriticalsCount}</div>
          <div className="text-[11px] text-rose-400/80 font-medium">Bloqueiam deploy para produção</div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Prontos para Produção</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{productionReadyCount}</div>
          <div className="text-[11px] text-slate-500">Aprovados em auditoria recente</div>
        </div>
      </div>

      {/* Projects List Section */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Seus Projetos em Auditoria</h2>
            <p className="text-xs text-slate-400">Selecione um projeto para submeter novo código ou rever relatórios de auditoria.</p>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Pesquisar projeto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2 pl-9 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="divide-y divide-slate-800/80">
          {filteredProjects.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <FolderPlus className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm font-medium">Nenhum projeto encontrado.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-xs text-cyan-400 hover:underline font-semibold"
              >
                Criar o seu primeiro projeto
              </button>
            </div>
          ) : (
            filteredProjects.map((proj) => (
              <div 
                key={proj.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-3">
                    <Link 
                      href={`/dashboard/project/${proj.id}`}
                      className="font-bold text-base text-white hover:text-cyan-400 transition-colors"
                    >
                      {proj.name}
                    </Link>

                    {/* Production Ready Badge */}
                    {proj.productionReady ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-800 text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Pronto para Produção</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-950 border border-rose-800 text-rose-400">
                        <ShieldAlert className="w-3 h-3" />
                        <span>Deploy Bloqueado</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-1">{proj.description}</p>

                  {proj.repositoryUrl && (
                    <div className="flex items-center space-x-1 text-[11px] font-mono text-slate-500">
                      <GitBranch className="w-3 h-3" />
                      <span>{proj.repositoryUrl}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-6 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/60">
                  {/* Score */}
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Último Score</div>
                    <div className={`text-xl font-extrabold ${
                      (proj.latestScore || 0) >= 85 ? 'text-emerald-400' :
                      (proj.latestScore || 0) >= 70 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {proj.latestScore !== undefined ? `${proj.latestScore}/100` : 'Sem dados'}
                    </div>
                  </div>

                  {/* Audits count */}
                  <div className="text-right hidden sm:block">
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Auditorias</div>
                    <div className="text-sm font-bold text-slate-300">{proj.auditCount} execuções</div>
                  </div>

                  {/* Actions */}
                  <Link
                    href={`/dashboard/project/${proj.id}`}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors flex items-center space-x-1"
                  >
                    <span>Gerir & Auditar</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal to Create Project */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <FolderPlus className="w-5 h-5 text-cyan-400" />
                <span>Criar Novo Projeto</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono font-medium text-slate-300">Nome do Projeto *</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex.: Serviço de Pagamentos / API Auth"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-medium text-slate-300">Descrição do Escopo</label>
                <textarea 
                  rows={3}
                  placeholder="Ex.: Rota de autenticação OAuth2 e endpoints de transações..."
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-medium text-slate-300">Link do Repositório GitHub (Opcional)</label>
                <input 
                  type="text"
                  placeholder="github.com/minha-empresa/meu-repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-cyan-500/20"
                >
                  Criar Projeto & Iniciar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
