import React, { useState } from 'react';
import { Key, ShieldAlert, X, Check, AlertCircle, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export function LoginModal({ isOpen, onClose, onLoginSuccess, isMandatory = false, config = {} }) {
  const [tab, setTab] = useState('member'); // 'member' | 'admin'
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Por favor, digite a senha.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (tab === 'member') {
        const res = await api.loginMember(password);
        if (res.success) {
          onLoginSuccess({ role: 'member' });
          setPassword('');
          if (onClose) onClose();
        } else {
          setError(res.message || 'Senha incorreta.');
        }
      } else {
        const res = await api.loginAdmin(password);
        if (res.success) {
          onLoginSuccess({ role: 'admin' });
          setPassword('');
          if (onClose) onClose();
        } else {
          setError(res.message || 'Senha da Diretoria incorreta.');
        }
      }
    } catch (err) {
      setError('Erro de conexão com o servidor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isMandatory ? 'bg-black/30' : 'bg-black/80 backdrop-blur-sm'} animate-fadeIn`}>
      {/* Container Card */}
      <div className="w-full max-w-md bg-[#16171d]/95 backdrop-blur-md border-2 border-amber-600/90 rounded-2xl shadow-2xl shadow-black overflow-hidden biker-border relative">
        {/* Decorative Top Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600" />

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-950 via-[#1f1915] to-[#16171d] px-6 py-5 flex items-center justify-between border-b border-amber-950">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-500 shadow-lg shadow-amber-950/60 flex-shrink-0 bg-black flex items-center justify-center">
              <img 
                src="/app-icon.jpg" 
                alt="INSANOS M.C." 
                className="w-full h-full object-contain p-0.5" 
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black uppercase text-white tracking-wider">
                  {config.clubName || "INSANOS M.C."}
                </h2>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600/70 font-bold uppercase">
                  {config.division || "MOGI GUAÇU"}
                </span>
              </div>
              <p className="text-xs text-amber-400 font-mono flex items-center gap-1 mt-0.5">
                <Lock className="w-3 h-3 text-amber-500 inline" />
                {tab === 'member' ? 'Acesso dos Irmãos' : 'Painel de Diretoria'}
              </p>
            </div>
          </div>

          {!isMandatory && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 p-1.5 bg-neutral-900/90 border-b border-neutral-800 text-xs font-bold uppercase tracking-wider">
          <button
            type="button"
            onClick={() => { setTab('member'); setError(''); }}
            className={`py-2.5 text-center rounded-lg transition flex items-center justify-center gap-1.5 ${
              tab === 'member'
                ? 'bg-amber-600 text-black font-black shadow-md shadow-amber-950'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            Acesso dos Irmãos
          </button>
          <button
            type="button"
            onClick={() => { setTab('admin'); setError(''); }}
            className={`py-2.5 text-center rounded-lg transition flex items-center justify-center gap-1.5 ${
              tab === 'admin'
                ? 'bg-amber-600 text-black font-black shadow-md shadow-amber-950'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Diretoria (Admin)
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2 flex items-center justify-between">
              <span>{tab === 'member' ? 'Senha de Acesso dos Irmãos:' : 'Senha da Diretoria (Admin):'}</span>
              <span className="text-[10px] text-amber-500 font-mono normal-case">
                {tab === 'member' ? '(Geral da Divisão)' : '(Acesso Restrito)'}
              </span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tab === 'member' ? 'DIGITE A SENHA DOS IRMÃOS...' : 'DIGITE A SENHA DE ADMIN...'}
                autoFocus
                className="w-full pl-4 pr-11 py-3 bg-[#0d0e12] border border-neutral-700 rounded-xl text-white text-base focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono tracking-widest placeholder:text-neutral-600 uppercase"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 7-Day Remember Badge */}
          <div className="p-3 bg-amber-950/30 border border-amber-900/60 rounded-xl flex items-center gap-2.5 text-xs text-amber-300 font-sans">
            <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="leading-snug">
              Este aparelho será <strong>lembrado por 7 dias</strong> automaticamente.
            </span>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-950/70 border border-red-800/80 rounded-xl text-red-200 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-extrabold uppercase tracking-wider text-sm transition flex items-center justify-center gap-2 shadow-lg bg-amber-600 hover:bg-amber-500 text-black shadow-amber-950/70 disabled:opacity-50"
            >
              {loading ? (
                <span>Verificando...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {tab === 'member' ? 'Entrar como Irmão' : 'Entrar como Diretoria'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
