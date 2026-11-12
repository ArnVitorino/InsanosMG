import React, { useState } from 'react';
import { Shield, ShieldAlert, Key, LogOut, Settings, Calendar, Users, CheckSquare, Sparkles } from 'lucide-react';
import { InstallAppButton } from './InstallAppButton';

export function Header({ 
  auth, 
  onLogout, 
  onOpenLogin, 
  onOpenAdminSettings, 
  config, 
  activeTab, 
  setActiveTab 
}) {
  return (
    <header className="bg-gradient-to-b from-[#18191e] to-[#0f1013] border-b border-red-950/60 sticky top-0 z-40 shadow-xl">
      {/* Top Bar with division banner */}
      <div className="max-w-[1500px] mx-auto px-3 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-red-600 shadow-lg shadow-red-950/60 flex-shrink-0 bg-black flex items-center justify-center">
            <img 
              src="/bg-insanos.jpg" 
              alt="INSANOS M.C." 
              className="w-full h-full object-cover object-[center_28%] scale-150" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-black tracking-wider text-red-500 uppercase drop-shadow">
                {config.clubName || "INSANOS M.C."}
              </h1>
              <span className="text-xs px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800/60 font-semibold tracking-wide">
                {config.division || "DIVISÃO MOGI GUAÇU"}
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-mono tracking-widest uppercase">
              {config.motto || "SOMOS DE VERDADE"}
            </p>
          </div>
        </div>

        {/* Auth / Role Indicator */}
        <div className="flex items-center gap-2">
          <InstallAppButton />
          {auth.role === 'admin' ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-red-900/60 text-red-200 border border-red-700 rounded-full text-xs font-bold tracking-wide shadow-sm">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                DIRETORIA (ADMIN)
              </span>
              <button
                onClick={onOpenAdminSettings}
                title="Configurações da Diretoria"
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition border border-neutral-700"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={onLogout}
                title="Sair"
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-900/50 text-neutral-300 hover:text-red-300 transition border border-neutral-700"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : auth.role === 'member' ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-800 rounded-full text-xs font-semibold tracking-wide">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Irmão
              </span>
              <button
                onClick={onOpenLogin}
                className="text-xs px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-neutral-700 transition"
              >
                Acesso Diretoria
              </button>
              <button
                onClick={onLogout}
                title="Sair"
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition border border-neutral-700"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition shadow-md shadow-red-950"
            >
              <Key className="w-3.5 h-3.5" />
              Entrar
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-[1500px] mx-auto px-3 sm:px-6 lg:px-8 flex gap-1 overflow-x-auto no-scrollbar border-t border-neutral-800/80">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold tracking-wide transition border-b-2 whitespace-nowrap ${
            activeTab === 'calendar'
              ? 'border-red-600 text-red-400 bg-red-950/20'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Calendário de Eventos
        </button>

        <button
          onClick={() => setActiveTab('attend')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold tracking-wide transition border-b-2 whitespace-nowrap ${
            activeTab === 'attend'
              ? 'border-red-600 text-red-400 bg-red-950/20'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          Confirmar Presença
        </button>

        <button
          onClick={() => setActiveTab('roster')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold tracking-wide transition border-b-2 whitespace-nowrap ${
            activeTab === 'roster'
              ? 'border-red-600 text-red-400 bg-red-950/20'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Users className="w-4 h-4" />
          Lista & WhatsApp
        </button>

        {auth.role === 'admin' && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold tracking-wide transition border-b-2 whitespace-nowrap ${
              activeTab === 'admin'
                ? 'border-amber-500 text-amber-400 bg-amber-950/20'
                : 'border-transparent text-amber-500/70 hover:text-amber-400'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Painel da Diretoria
          </button>
        )}
      </div>
    </header>
  );
}
