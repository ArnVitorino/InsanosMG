import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share } from 'lucide-react';

export function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // Check if already in standalone app mode
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  if (isInstalled) return null;

  const handleInstallClick = async () => {
    // Check if iOS
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(true);
    } else {
      // General prompt
      alert('Para instalar o app no seu celular:\n1. Toque nos três pontinhos do navegador\n2. Selecione "Instalar Aplicativo" ou "Adicionar à Tela Inicial"');
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        title="Baixar aplicativo no celular"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-semibold tracking-wide transition shadow-sm"
      >
        <Smartphone className="w-3.5 h-3.5 text-red-400" />
        <span className="hidden sm:inline">Baixar</span> App
      </button>

      {/* iOS Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#16171d] border border-red-900 rounded-2xl p-5 shadow-2xl biker-border space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <div className="flex items-center gap-2 text-sm font-bold text-white uppercase">
                <Smartphone className="w-4 h-4 text-red-500" />
                Como Baixar no iPhone
              </div>
              <button
                onClick={() => setShowIosGuide(false)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-300">
              <p>Você pode instalar o app do Insanos na tela do seu iPhone em 2 passos:</p>
              <div className="flex items-start gap-2.5 p-2.5 bg-neutral-900 rounded-lg border border-neutral-800">
                <span className="w-5 h-5 rounded-full bg-red-950 text-red-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">1</span>
                <span>Toque no botão de <strong>Compartilhar</strong> do Safari (o ícone de quadrado com uma setinha apontando para cima).</span>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 bg-neutral-900 rounded-lg border border-neutral-800">
                <span className="w-5 h-5 rounded-full bg-red-950 text-red-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">2</span>
                <span>Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong>.</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                O ícone do INSANOS M.C. vai aparecer direto na tela do seu celular como um app normal!
              </p>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold uppercase transition"
            >
              Entendi!
            </button>
          </div>
        </div>
      )}
    </>
  );
}

