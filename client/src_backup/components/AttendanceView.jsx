import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, User, Calendar, MapPin, Clock, Send, Sparkles, Check, ChevronDown } from 'lucide-react';
import { api } from '../services/api';

const QUICK_REASONS = [
  "Social + Sede",
  "Trabalho",
  "Família",
  "Viagem",
  "Plantão",
  "Saúde"
];

export function AttendanceView({ 
  events, 
  selectedEventId, 
  onSelectEvent, 
  members, 
  eventDetails, 
  onRefresh,
  onOpenRosterTab 
}) {
  const [selectedMemberId, setSelectedMemberId] = useState(() => {
    return localStorage.getItem('insanos_saved_member_id') || '';
  });
  const [status, setStatus] = useState('yes'); // 'yes' | 'no' | 'maybe'
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // If selectedMemberId changes, remember in localStorage
  useEffect(() => {
    if (selectedMemberId) {
      localStorage.setItem('insanos_saved_member_id', selectedMemberId);

      // Pre-fill current attendance if already exists in this event
      if (eventDetails?.roster) {
        const found = eventDetails.roster.find(r => r.memberId === parseInt(selectedMemberId, 10));
        if (found && found.status && found.status !== 'pending') {
          setStatus(found.status);
          setReason(found.reason || '');
        }
      }
    }
  }, [selectedMemberId, eventDetails]);

  const activeEvent = events.find(e => e.id === selectedEventId) || events[0];

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!activeEvent) return;
    if (!selectedMemberId) {
      setFeedback({ type: 'error', message: 'Selecione seu nome na lista de integrantes.' });
      return;
    }

    if (status === 'no' && !reason.trim()) {
      setFeedback({ type: 'error', message: 'Por favor, informe o motivo ao marcar que não vai.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await api.submitAttendance(
        activeEvent.id, 
        selectedMemberId, 
        status, 
        status === 'no' ? reason.trim() : (status === 'maybe' ? reason.trim() : '')
      );

      if (res.success) {
        const memberObj = members.find(m => m.id === parseInt(selectedMemberId, 10));
        setFeedback({ 
          type: 'success', 
          message: `Presença confirmada com sucesso para ${memberObj?.name || 'você'}!` 
        });
        onRefresh();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Erro ao salvar presença.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro de comunicação com o servidor.' });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedMemberObj = members.find(m => m.id === parseInt(selectedMemberId, 10));
  const currentAttendance = eventDetails?.roster?.find(r => r.memberId === parseInt(selectedMemberId, 10));

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Event Selector Dropdown if more than 1 event */}
      {events.length > 1 && (
        <div className="bg-[#14151a] border border-neutral-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-mono uppercase tracking-wider text-neutral-400">
            Evento Selecionado:
          </label>
          <select
            value={activeEvent?.id || ''}
            onChange={(e) => onSelectEvent(parseInt(e.target.value, 10))}
            className="bg-[#0b0c0e] border border-neutral-700 text-white rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-red-500"
          >
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>
                {ev.title} ({ev.dateFormatted || ev.date})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Event Details Card */}
      {activeEvent && (
        <div className="bg-gradient-to-b from-[#181920] to-[#121317] border border-red-950/80 rounded-2xl p-5 md:p-6 shadow-2xl biker-border space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
            <span className="text-xs font-mono text-red-400 uppercase tracking-widest font-bold">
              {activeEvent.divisionHeader || "INSANOS M.C. – DIVISÃO MOGI GUAÇU"}
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-red-950/80 text-red-200 border border-red-800 font-mono">
              Chamada Oficial
            </span>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-wide uppercase">
              {activeEvent.title}
            </h2>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span className="font-medium">{activeEvent.dateFormatted || activeEvent.date}</span>
              </div>
              {activeEvent.time && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>{activeEvent.time}</span>
                </div>
              )}
              {activeEvent.location && (
                <div className="flex items-start gap-2 sm:col-span-2">
                  <MapPin className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>{activeEvent.location}</span>
                </div>
              )}
            </div>
          </div>

          {activeEvent.description && (
            <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800 text-xs text-neutral-300 whitespace-pre-line font-sans">
              <span className="font-bold text-red-400 block mb-1">🎸 Detalhes do Evento:</span>
              {activeEvent.description}
            </div>
          )}

          {/* Real-time stats */}
          {activeEvent.stats && (
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-800/80 text-center">
              <div className="bg-emerald-950/30 border border-emerald-900/40 rounded-xl p-2">
                <span className="text-lg font-black text-emerald-400 block">
                  {activeEvent.stats.yesCount}
                </span>
                <span className="text-[10px] font-mono uppercase text-emerald-300">
                  Confirmados
                </span>
              </div>
              <div className="bg-red-950/30 border border-red-900/40 rounded-xl p-2">
                <span className="text-lg font-black text-red-400 block">
                  {activeEvent.stats.noCount}
                </span>
                <span className="text-[10px] font-mono uppercase text-red-300">
                  Não Vão
                </span>
              </div>
              <div className="bg-amber-950/30 border border-amber-900/40 rounded-xl p-2">
                <span className="text-lg font-black text-amber-400 block">
                  {activeEvent.stats.pendingCount + activeEvent.stats.maybeCount}
                </span>
                <span className="text-[10px] font-mono uppercase text-amber-300">
                  Pendentes
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Form */}
      <div className="bg-[#15161c] border border-neutral-800 rounded-2xl p-5 md:p-6 shadow-xl biker-border">
        <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2 mb-4 border-b border-neutral-800 pb-3">
          <Check className="w-5 h-5 text-red-500" />
          Registrar sua Confirmação
        </h3>

        <form onSubmit={handleConfirm} className="space-y-5">
          {/* Step 1: Member Selector */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
              1. Qual integrante é você?
            </label>
            <div className="relative">
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full px-4 py-3 bg-[#0c0d10] border border-neutral-700 rounded-xl text-white text-base font-semibold focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 appearance-none cursor-pointer"
              >
                <option value="">Selecione seu nome na lista...</option>
                {members.map((member, idx) => (
                  <option key={member.id} value={member.id}>
                    {idx + 1}. {member.name} {member.nickname ? `(${member.nickname})` : ''}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {currentAttendance && currentAttendance.status !== 'pending' && (
              <p className="text-xs mt-2 text-neutral-400 font-mono">
                Status atual gravado:{' '}
                {currentAttendance.status === 'yes' && (
                  <span className="text-emerald-400 font-bold">✅ Confirmado (Eu vou)</span>
                )}
                {currentAttendance.status === 'no' && (
                  <span className="text-red-400 font-bold">
                    ❌ Não vou {currentAttendance.reason ? `(${currentAttendance.reason})` : ''}
                  </span>
                )}
                {currentAttendance.status === 'maybe' && (
                  <span className="text-amber-400 font-bold">
                    ⚠️ Ainda não sei {currentAttendance.reason ? `(${currentAttendance.reason})` : ''}
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Step 2: Attendance Choice */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
              2. Confirme sua presença:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Option: Sim */}
              <button
                type="button"
                onClick={() => setStatus('yes')}
                className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
                  status === 'yes'
                    ? 'bg-emerald-950/60 border-emerald-500 shadow-lg shadow-emerald-950/50'
                    : 'bg-[#0f1013] border-neutral-800 hover:border-neutral-700 text-neutral-300'
                }`}
              >
                <div>
                  <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    ✅ Eu vou.
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Presença confirmada
                  </p>
                </div>
                {status === 'yes' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                )}
              </button>

              {/* Option: Não */}
              <button
                type="button"
                onClick={() => setStatus('no')}
                className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
                  status === 'no'
                    ? 'bg-red-950/60 border-red-500 shadow-lg shadow-red-950/50'
                    : 'bg-[#0f1013] border-neutral-800 hover:border-neutral-700 text-neutral-300'
                }`}
              >
                <div>
                  <div className="text-sm font-bold text-red-400 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" />
                    ❌ Não vou.
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Informar motivo
                  </p>
                </div>
                {status === 'no' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                )}
              </button>

              {/* Option: Talvez */}
              <button
                type="button"
                onClick={() => setStatus('maybe')}
                className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
                  status === 'maybe'
                    ? 'bg-amber-950/60 border-amber-500 shadow-lg shadow-amber-950/50'
                    : 'bg-[#0f1013] border-neutral-800 hover:border-neutral-700 text-neutral-300'
                }`}
              >
                <div>
                  <div className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    ⚠️ Ainda não sei.
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Confirmo em breve
                  </p>
                </div>
                {status === 'maybe' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                )}
              </button>
            </div>
          </div>

          {/* Step 3: Justification field if Não (or optional for Maybe) */}
          {(status === 'no' || status === 'maybe') && (
            <div className="bg-[#0e0f13] p-4 rounded-xl border border-neutral-800 space-y-3 animate-fadeIn">
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300">
                {status === 'no' ? 'Informe o Motivo / Justificativa (Obrigatório):' : 'Observação (Opcional):'}
              </label>

              {/* Quick Suggestion Chips */}
              <div className="flex flex-wrap gap-1.5">
                {QUICK_REASONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setReason(q)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                      reason === q
                        ? 'bg-red-800 text-white border-red-600'
                        : 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Text Input */}
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Social + Sede, Trabalho, Família..."
                className="w-full px-3.5 py-2.5 bg-[#08090b] border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-600 placeholder:text-neutral-600"
              />
            </div>
          )}

          {/* Feedback messages */}
          {feedback && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/80 border border-emerald-700 text-emerald-200'
                  : 'bg-red-950/80 border border-red-700 text-red-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold uppercase tracking-wider text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-red-950/70 disabled:opacity-50"
          >
            {submitting ? (
              <span>Gravando resposta...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Salvar Confirmação
              </>
            )}
          </button>
        </form>
      </div>

      {/* Button to view WhatsApp roster */}
      <div className="text-center pt-2">
        <button
          onClick={onOpenRosterTab}
          className="text-xs text-neutral-400 hover:text-red-400 underline font-mono tracking-wider transition"
        >
          Visualizar Lista Completa da Divisão & Copiar para WhatsApp →
        </button>
      </div>
    </div>
  );
}
