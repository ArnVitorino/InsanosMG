import React, { useState } from 'react';
import { Key, ShieldAlert, X, Check, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [tab, setTab] = useState('member'); // 'member' | 'admin'
  const [password, setPassword] = useState('');
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
          onClose();
        } else {
          setError(res.message || 'Senha incorreta.');
        }
      } else {
        const res = await api.loginAdmin(password);
        if (res.success) {
          onLoginSuccess({ role: 'admin' });
          setPassword('');
          onClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#16171d] border border-red-900/60 rounded-2xl shadow-2xl overflow-hidden biker-border">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-950 via-[#1e1416] to-[#16171d] px-6 py-4 flex items-center justify-between border-b border-red-950">
          <div className="flex items-center gap-2">
            <span className="text-2xl">☠️</span>
            <div>
              <h2 className="text-base font-black uppercase text-white tracking-wider">
                INSANOS M.C.
              </h2>
              <p className="text-xs text-red-400 font-mono">
                {tab === 'member' ? 'Acesso dos Irmãos' : 'Painel de Diretoria (Admin)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 p-1.5 bg-neutral-900/80 border-b border-neutral-800 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => { setTab('member'); setError(''); }}
            className={`py-2 text-center rounded-lg transition flex items-center justify-center gap-1.5 ${
              tab === 'member'
                ? 'bg-red-700 text-white shadow-md shadow-red-950'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            Irmãos (ISSI)
          </button>
          <button
            onClick={() => { setTab('admin'); setError(''); }}
            className={`py-2 text-center rounded-lg transition flex items-center justify-center gap-1.5 ${
              tab === 'admin'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-950'
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
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
              {tab === 'member'
                ? 'Digite a senha do motoclube:'
                : 'Digite a senha de administrador:'}
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tab === 'member' ? 'Digite ISSI' : 'Senha do Admin'}
                autoFocus
                className="w-full px-4 py-3 bg-[#0d0e12] border border-neutral-700 rounded-xl text-white text-base focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 font-mono tracking-widest placeholder:text-neutral-600 uppercase"
              />
            </div>
            {tab === 'member' && (
              <p className="text-[11px] text-neutral-400 mt-2">
                💡 Aceita maiúscula ou minúscula: <span className="text-red-400 font-mono font-bold">issi</span> ou <span className="text-red-400 font-mono font-bold">ISSI</span>.
              </p>
            )}
            {tab === 'admin' && (
              <p className="text-[11px] text-neutral-500 mt-2">
                (Senha padrão inicial: <span className="text-amber-400 font-mono">admin123</span> - pode ser alterada nas configurações)
              </p>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-200 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold uppercase tracking-wider text-sm transition flex items-center justify-center gap-2 shadow-lg ${
                tab === 'member'
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-950/60'
                  : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-950/60'
              } disabled:opacity-50`}
            >
              {loading ? (
                <span>Verificando...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {tab === 'member' ? 'Acessar como Irmão' : 'Acessar como Diretoria'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
