import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, MessageCircle, Share2, Sparkles } from 'lucide-react';
import { generateEventInviteText, openWhatsAppWithText, RENDER_APP_URL } from '../utils/whatsapp';

export function WhatsAppInviteModal({ isOpen, onClose, event, config }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !event) return null;

  const inviteText = generateEventInviteText(event, config);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const handleOpenWhatsApp = () => {
    openWhatsAppWithText(inviteText);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-[#14151a] border-2 border-emerald-600/80 rounded-2xl shadow-2xl shadow-black overflow-hidden biker-border flex flex-col max-h-[92vh]">
        {/* Top Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 via-amber-500 to-emerald-600" />

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-[#161f18] to-[#14151a] px-6 py-4 flex items-center justify-between border-b border-emerald-900/60 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/70 flex items-center justify-center text-emerald-400 shadow-md">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase text-white tracking-wider flex items-center gap-2">
                Convocação para WhatsApp
              </h2>
              <p className="text-xs text-emerald-300 font-mono">
                {event.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-sans">
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-200 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="font-bold">Link de confirmação configurado:</p>
              <p className="text-[11px] font-mono text-emerald-400 underline">{RENDER_APP_URL}</p>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-300 border border-emerald-600">
              Oficial Render
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
              Pré-visualização da mensagem para os irmãos:
            </label>
            <div className="bg-[#0b0c0e] border border-neutral-800 rounded-xl p-4 font-mono text-[11px] leading-relaxed text-neutral-200 whitespace-pre-wrap max-h-64 overflow-y-auto select-all shadow-inner border-l-4 border-l-emerald-500">
              {inviteText}
            </div>
          </div>

          {copied && (
            <div className="p-2.5 bg-emerald-950/80 border border-emerald-600 rounded-lg text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Mensagem copiada para a área de transferência! Cole no WhatsApp.</span>
            </div>
          )}
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 bg-[#0d0e12] border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-end gap-2.5 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-bold uppercase tracking-wider transition border border-neutral-700"
          >
            Fechar
          </button>

          <button
            onClick={handleCopy}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-md ${
              copied
                ? 'bg-emerald-600 text-black shadow-emerald-950'
                : 'bg-neutral-700 hover:bg-neutral-600 text-white'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copiado!' : 'Copiar Texto'}
          </button>

          <button
            onClick={handleOpenWhatsApp}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-black font-black rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/70"
          >
            <Share2 className="w-4 h-4" />
            <span>Abrir no WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
