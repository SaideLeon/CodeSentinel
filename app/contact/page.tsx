"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Mail, Send, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 sm:p-12 max-w-2xl mx-auto space-y-8">
      <Link href="/" className="inline-flex items-center space-x-2 text-xs text-slate-400 hover:text-cyan-400 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar à Página Inicial</span>
      </Link>

      <div className="space-y-3 border-b border-slate-800 pb-6 text-center">
        <Link href="/" className="inline-flex items-center space-x-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">SecAudit Pro</span>
        </Link>
        <h1 className="text-2xl font-bold text-white pt-2">Contacte a Nossa Equipa de Segurança</h1>
        <p className="text-xs text-slate-400">Tem dúvidas sobre integração de equipa, planos enterprise ou regras personalizadas?</p>
      </div>

      {submitted ? (
        <div className="p-8 bg-slate-900 border border-cyan-800 rounded-2xl text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-cyan-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Mensagem Enviada com Sucesso!</h2>
          <p className="text-xs text-slate-400">
            A nossa equipa técnica irá analisar o seu pedido e responder em menos de 24 horas úteis.
          </p>
          <Link href="/" className="inline-block pt-2 text-xs text-cyan-400 font-semibold hover:underline">
            Voltar para a homepage
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-slate-900 p-8 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <div className="space-y-1">
            <label className="text-xs font-mono font-medium text-slate-300">Seu Nome *</label>
            <input 
              type="text"
              required
              placeholder="Ex.: Maria Santos"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono font-medium text-slate-300">E-mail Profissional *</label>
            <input 
              type="email"
              required
              placeholder="maria@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono font-medium text-slate-300">Mensagem *</label>
            <textarea 
              rows={4}
              required
              placeholder="Como podemos ajudar a sua equipa de engenharia?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl transition-all shadow-md shadow-cyan-500/20 text-sm flex items-center justify-center space-x-2 mt-2"
          >
            <span>Enviar Mensagem</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}
