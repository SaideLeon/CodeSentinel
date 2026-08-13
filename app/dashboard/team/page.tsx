"use client";

import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Mail, 
  ShieldCheck, 
  Building, 
  User, 
  Trash2, 
  CheckCircle2, 
  MoreVertical 
} from 'lucide-react';
import { store } from '@/lib/store/security-store';

export default function TeamPage() {
  const [user, setUser] = useState(store.getUser());
  const [teamMembers, setTeamMembers] = useState(store.getTeamMembers());
  
  // Profile form state
  const [name, setName] = useState(user.name);
  const [company, setCompany] = useState(user.company);
  const [profileMsg, setProfileMsg] = useState('');

  // Invite modal state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER' | 'READONLY'>('MEMBER');

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateUserProfile({ name, company });
    setUser(store.getUser());
    setProfileMsg('Perfil atualizado com sucesso!');
    setTimeout(() => setProfileMsg(''), 3000);
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    store.addTeamMember(inviteEmail, inviteRole);
    setTeamMembers(store.getTeamMembers());
    setIsInviteOpen(false);
    setInviteEmail('');
  };

  const handleRemoveMember = (id: string) => {
    store.removeTeamMember(id);
    setTeamMembers(store.getTeamMembers());
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
          <Users className="w-6 h-6 text-cyan-400" />
          <span>Equipa & Definições da Conta</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Gerir membros da equipa, permissões de acesso e dados do perfil.
        </p>
      </div>

      {/* User Profile Form */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6">
        <div>
          <h2 className="text-base font-bold text-white">O Seu Perfil</h2>
          <p className="text-xs text-slate-400">Informações pessoais e da organização associada.</p>
        </div>

        {profileMsg && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold rounded-xl">
            {profileMsg}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-mono font-medium text-slate-300">Nome Completo</label>
            <div className="relative">
              <input 
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 pl-9"
              />
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono font-medium text-slate-300">Empresa / Organização</label>
            <div className="relative">
              <input 
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 pl-9"
              />
              <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <div className="sm:col-span-2 pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-cyan-500/20"
            >
              Guardar Alterações do Perfil
            </button>
          </div>
        </form>
      </div>

      {/* Team Members List */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden space-y-4">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white">Membros da Equipa ({teamMembers.length})</h2>
            <p className="text-xs text-slate-400">Pessoas com acesso às auditorias de código desta conta.</p>
          </div>

          <button
            onClick={() => setIsInviteOpen(true)}
            className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Convidar Membro</span>
          </button>
        </div>

        <div className="divide-y divide-slate-800/80">
          {teamMembers.map((member) => (
            <div key={member.id} className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
              <div className="flex items-center space-x-3">
                <img 
                  src={member.avatarUrl} 
                  alt={member.name}
                  className="w-9 h-9 rounded-full border border-slate-700 object-cover"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center space-x-2">
                    <span>{member.name}</span>
                    {member.role === 'OWNER' && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 font-bold">
                        Proprietário
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">{member.email}</div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-xs font-mono text-slate-400 uppercase">{member.role}</span>
                {member.role !== 'OWNER' && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Remover acesso"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-cyan-400" />
                <span>Convidar Novo Colaborador</span>
              </h3>
              <button onClick={() => setIsInviteOpen(false)} className="text-slate-500 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleInviteMember} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono font-medium text-slate-300">E-mail do Colaborador *</label>
                <input 
                  type="email"
                  required
                  placeholder="dev.lead@empresa.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-medium text-slate-300">Nível de Permissão</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                >
                  <option value="MEMBER">Desenvolvedor (Executa e visualiza auditorias)</option>
                  <option value="ADMIN">Administrador (Gerencia membros e faturação)</option>
                  <option value="READONLY">Auditor Externo (Apenas leitura)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end space-x-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold rounded-xl shadow"
                >
                  Enviar Convite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
