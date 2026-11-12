import React, { useState } from 'react';
import { Copy, Check, Search, Filter, Share2, CheckCircle2, XCircle, AlertTriangle, Clock, RefreshCw, Edit3 } from 'lucide-react';
import { api } from '../services/api';

export function RosterList({ 
  eventDetails, 
  events, 
  selectedEventId, 
  onSelectEvent, 
  onRefresh, 
  auth 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'yes' | 'no' | 'pending' | 'maybe'
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [adminEditingMember, setAdminEditingMember] = useState(null);
  const [adminStatus, setAdminStatus] = useState('yes');
  const [adminReason, setAdminReason] = useState('');
  const [updating, setUpdating] = useState(false);

  const activeEvent = events.find(e => e.id === selectedEventId) || events[0];
  const roster = eventDetails?.roster || [];
  const whatsappText = eventDetails?.whatsappText || '';

  // Stats calculation
  const total = roster.length;
  const yesList = roster.filter(r => r.status === 'yes');
  const noList = roster.filter(r => r.status === 'no');
  const maybeList = roster.filter(r => r.status === 'maybe');
  const pendingList = roster.filter(r => !r.status || r.status === 'pending');

  // Filtered roster
  const filteredRoster = roster.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.nickname && item.nickname.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (filterStatus === 'all') return true;
    if (filterStatus === 'yes') return item.status === 'yes';
    if (filterStatus === 'no') return item.status === 'no';
    if (filterStatus === 'maybe') return item.status === 'maybe';
    if (filterStatus === 'pending') return !item.status || item.status === 'pending';
    return true;
  });

  const handleCopyWhatsApp = async () => {
    if (!whatsappText) return;
    try {
      await navigator.clipboard.writeText(whatsappText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  const handleAdminUpdateStatus = async (e) => {
    e.preventDefault();
    if (!adminEditingMember || !activeEvent) return;

    setUpdating(true);
    try {
      await api.submitAttendance(
        activeEvent.id,
        adminEditingMember.memberId,
        adminStatus,
        adminStatus === 'no' ? adminReason : (adminStatus === 'maybe' ? adminReason : '')
      );
      setAdminEditingMember(null);
      setAdminReason('');
      onRefresh();
    } catch (err) {
      alert('Erro ao atualizar presença do integrante.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Event Header & WhatsApp Action Card */}
      <div className="bg-gradient-to-b from-[#181920] to-[#121317] border border-red-950/80 rounded-2xl p-5 md:p-6 shadow-2xl biker-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div>
            <span className="text-[11px] font-mono text-red-400 uppercase tracking-widest font-bold">
              {activeEvent?.divisionHeader || "INSANOS M.C. – DIVISÃO MOGI GUAÇU"}
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wide">
              {activeEvent?.title}
            </h2>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">
              📅 {activeEvent?.dateFormatted || activeEvent?.date} {activeEvent?.time ? `• ⏰ ${activeEvent.time}` : ''}
            </p>
          </div>

          {/* Big WhatsApp Copy Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyWhatsApp}
              className={`px-4 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition flex items-center justify-center gap-2 shadow-lg flex-1 sm:flex-initial ${
                copied
                  ? 'bg-emerald-600 text-white shadow-emerald-950'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/80 hover:scale-[1.02]'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copiado para o WhatsApp!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  Copiar Lista para WhatsApp
                </>
              )}
            </button>
            <button
              onClick={onRefresh}
              title="Atualizar lista"
              className="p-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Counters summary bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => setFilterStatus('all')}
            className={`p-3 rounded-xl border text-center transition ${
              filterStatus === 'all'
                ? 'bg-neutral-800 border-neutral-600'
                : 'bg-[#101115] border-neutral-800/80 hover:border-neutral-700'
            }`}
          >
            <span className="text-xs text-neutral-400 font-mono uppercase block">Total</span>
            <span className="text-xl font-black text-white">{total}</span>
          </button>

          <button
            onClick={() => setFilterStatus('yes')}
            className={`p-3 rounded-xl border text-center transition ${
              filterStatus === 'yes'
                ? 'bg-emerald-950/60 border-emerald-500'
                : 'bg-[#101115] border-neutral-800/80 hover:border-neutral-700'
            }`}
          >
            <span className="text-xs text-emerald-400 font-mono uppercase block">✅ Confirmados</span>
            <span className="text-xl font-black text-emerald-400">{yesList.length}</span>
          </button>

          <button
            onClick={() => setFilterStatus('no')}
            className={`p-3 rounded-xl border text-center transition ${
              filterStatus === 'no'
                ? 'bg-red-950/60 border-red-500'
                : 'bg-[#101115] border-neutral-800/80 hover:border-neutral-700'
            }`}
          >
            <span className="text-xs text-red-400 font-mono uppercase block">❌ Não Vão</span>
            <span className="text-xl font-black text-red-400">{noList.length}</span>
          </button>

          <button
            onClick={() => setFilterStatus('pending')}
            className={`p-3 rounded-xl border text-center transition ${
              filterStatus === 'pending'
                ? 'bg-amber-950/60 border-amber-500'
                : 'bg-[#101115] border-neutral-800/80 hover:border-neutral-700'
            }`}
          >
            <span className="text-xs text-amber-400 font-mono uppercase block">⚠️ Pendentes</span>
            <span className="text-xl font-black text-amber-400">{pendingList.length + maybeList.length}</span>
          </button>
        </div>

        {/* WhatsApp Preview Toggle */}
        <div className="pt-1">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1.5 transition"
          >
            <span>{showPreview ? '▲ Ocultar visualização do texto WhatsApp' : '▼ Ver prévia do texto formatado para o WhatsApp'}</span>
          </button>

          {showPreview && (
            <div className="mt-3 p-4 bg-[#090a0d] border border-neutral-800 rounded-xl relative">
              <pre className="font-mono text-xs text-neutral-300 whitespace-pre-wrap select-all">
                {whatsappText}
              </pre>
              <button
                onClick={handleCopyWhatsApp}
                className="absolute top-3 right-3 p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-mono flex items-center gap-1 border border-neutral-700"
              >
                <Copy className="w-3.5 h-3.5" />
                Copiar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#14151a] border border-neutral-800 rounded-2xl p-4 shadow-xl biker-border space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar integrante por nome..."
              className="w-full pl-9 pr-4 py-2 bg-[#0c0d10] border border-neutral-700 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-red-600 placeholder:text-neutral-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                filterStatus === 'all'
                  ? 'bg-neutral-700 text-white'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Todos ({total})
            </button>
            <button
              onClick={() => setFilterStatus('yes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                filterStatus === 'yes'
                  ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-600'
                  : 'bg-neutral-900 text-emerald-400 hover:bg-neutral-800'
              }`}
            >
              ✅ ({yesList.length})
            </button>
            <button
              onClick={() => setFilterStatus('no')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                filterStatus === 'no'
                  ? 'bg-red-900/80 text-red-200 border border-red-600'
                  : 'bg-neutral-900 text-red-400 hover:bg-neutral-800'
              }`}
            >
              ❌ ({noList.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                filterStatus === 'pending'
                  ? 'bg-amber-900/80 text-amber-200 border border-amber-600'
                  : 'bg-neutral-900 text-amber-400 hover:bg-neutral-800'
              }`}
            >
              ⚠️ ({pendingList.length})
            </button>
          </div>
        </div>

        {/* Member Roster List */}
        <div className="divide-y divide-neutral-800/80 border-t border-neutral-800/80 pt-2">
          {filteredRoster.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500 font-mono">
              Nenhum integrante encontrado com o filtro aplicado.
            </div>
          ) : (
            filteredRoster.map((item) => {
              const isNo = item.status === 'no';
              const isYes = item.status === 'yes';
              const isMaybe = item.status === 'maybe';
              const isPending = !item.status || item.status === 'pending';

              return (
                <div
                  key={item.memberId}
                  className="py-3 px-2 flex flex-wrap items-center justify-between gap-3 hover:bg-neutral-900/50 rounded-xl transition"
                >
                  <div className="flex items-center gap-3">
                    {/* Number */}
                    <span className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs font-mono font-bold text-neutral-400 flex-shrink-0">
                      {item.orderNumber}
                    </span>

                    {/* Member Name */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          {item.name}
                        </span>
                        {item.nickname && (
                          <span className="text-xs text-neutral-400 font-mono">
                            "{item.nickname}"
                          </span>
                        )}
                      </div>
                      {/* Reason badge */}
                      {isNo && item.reason && (
                        <p className="text-xs text-red-400/90 font-mono flex items-center gap-1 mt-0.5">
                          <span>Motivo:</span>
                          <span className="font-semibold">{item.reason}</span>
                        </p>
                      )}
                      {isMaybe && item.reason && (
                        <p className="text-xs text-amber-400/90 font-mono mt-0.5">
                          Obs: {item.reason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status Indicator & Admin Action */}
                  <div className="flex items-center gap-2">
                    {isYes && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Eu vou
                      </span>
                    )}
                    {isNo && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-950/80 text-red-300 border border-red-800 text-xs font-bold">
                        <XCircle className="w-3.5 h-3.5" />
                        Não vou
                      </span>
                    )}
                    {isMaybe && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800 text-xs font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Em dúvida
                      </span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-neutral-900 text-neutral-400 border border-neutral-700 text-xs font-mono">
                        <Clock className="w-3 h-3" />
                        Pendente
                      </span>
                    )}

                    {/* Admin Edit Shortcut */}
                    {auth.role === 'admin' && (
                      <button
                        onClick={() => {
                          setAdminEditingMember(item);
                          setAdminStatus(item.status || 'yes');
                          setAdminReason(item.reason || '');
                        }}
                        title="Diretoria: Ajustar presença"
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition border border-neutral-700"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Admin Quick Adjust Modal */}
      {adminEditingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#16171d] border border-amber-600/70 rounded-2xl p-5 shadow-2xl biker-border space-y-4">
            <h3 className="text-sm font-black uppercase text-amber-400 flex items-center gap-2 border-b border-neutral-800 pb-2">
              <Edit3 className="w-4 h-4" />
              Diretoria: Ajustar Presença de {adminEditingMember.name}
            </h3>

            <form onSubmit={handleAdminUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-neutral-300 uppercase mb-2">
                  Status:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdminStatus('yes')}
                    className={`py-2 rounded-lg text-xs font-bold border ${
                      adminStatus === 'yes'
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    ✅ Vai
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminStatus('no')}
                    className={`py-2 rounded-lg text-xs font-bold border ${
                      adminStatus === 'no'
                        ? 'bg-red-950 border-red-500 text-red-300'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    ❌ Não vai
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminStatus('maybe')}
                    className={`py-2 rounded-lg text-xs font-bold border ${
                      adminStatus === 'maybe'
                        ? 'bg-amber-950 border-amber-500 text-amber-300'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    ⚠️ Dúvida
                  </button>
                </div>
              </div>

              {adminStatus === 'no' && (
                <div>
                  <label className="block text-xs font-mono text-neutral-300 uppercase mb-1">
                    Motivo / Justificativa:
                  </label>
                  <input
                    type="text"
                    value={adminReason}
                    onChange={(e) => setAdminReason(e.target.value)}
                    placeholder="Ex: Social + Sede, Trabalho..."
                    className="w-full px-3 py-2 bg-[#0c0d10] border border-neutral-700 rounded-lg text-white text-xs"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdminEditingMember(null)}
                  className="flex-1 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold uppercase"
                >
                  {updating ? 'Gravando...' : 'Salvar Alteração'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

