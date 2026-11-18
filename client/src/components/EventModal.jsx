import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, AlignLeft, Check, Image as ImageIcon, Upload, Trash2, MessageCircle, Share2, Copy } from 'lucide-react';
import { api } from '../services/api';
import { generateEventInviteText, openWhatsAppWithText, RENDER_APP_URL } from '../utils/whatsapp';

export function EventModal({ 
  isOpen, 
  onClose, 
  eventToEdit, 
  config, 
  initialDate, 
  onSuccess 
}) {
  const [title, setTitle] = useState('');
  const [divisionHeader, setDivisionHeader] = useState('');
  const [date, setDate] = useState('');
  const [dateFormatted, setDateFormatted] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Evento Oficial');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [savedSuccessEvent, setSavedSuccessEvent] = useState(null);
  const [copiedInvite, setCopiedInvite] = useState(false);

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title || '');
      setDivisionHeader(eventToEdit.divisionHeader || `${config.clubName} – ${config.division}`);
      setDate(eventToEdit.date || '');
      setDateFormatted(eventToEdit.dateFormatted || '');
      setTime(eventToEdit.time || '');
      setLocation(eventToEdit.location || '');
      setCategory(eventToEdit.category || 'Evento Oficial');
      setDescription(eventToEdit.description || '');
      setImageUrl(eventToEdit.imageUrl || '');
    } else {
      setTitle('');
      setDivisionHeader(`${config.clubName || 'INSANOS M.C.'} – ${config.division || 'DIVISÃO MOGI GUAÇU'}`);
      const defaultDate = initialDate || new Date().toISOString().split('T')[0];
      setDate(defaultDate);
      setDateFormatted('');
      setTime('A partir das 14:00');
      setLocation('');
      setCategory('Evento Oficial');
      setDescription('Encontro de Motoclubes + Festival de Rock\n\nProgramação com bandas, gastronomia e espaço para as famílias.');
      setImageUrl('');
    }
    setError('');
    setSavedSuccessEvent(null);
    setCopiedInvite(false);
  }, [eventToEdit, isOpen, config, initialDate]);

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setError('A imagem selecionada é muito pesada (máx 15MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  // Auto-format friendly date label when date changes if empty
  const handleDateChange = (val) => {
    setDate(val);
    if (!val) return;
    try {
      const [y, m, d] = val.split('-');
      const dObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
      const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
      const dayName = days[dObj.getDay()];
      const monthName = months[dObj.getMonth()];
      setDateFormatted(`${dayName} – ${parseInt(d)} de ${monthName} de ${y}`);
    } catch (e) {
      // ignore
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !date.trim()) {
      setError('Título e Data são obrigatórios.');
      return;
    }

    setSubmitting(true);
    setError('');

    const payload = {
      title: title.trim(),
      divisionHeader: divisionHeader.trim(),
      date: date.trim(),
      dateFormatted: dateFormatted.trim() || date.trim(),
      time: time.trim(),
      location: location.trim(),
      category: category.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim()
    };

    try {
      let result;
      if (eventToEdit) {
        result = await api.updateEvent(eventToEdit.id, payload);
      } else {
        result = await api.createEvent(payload);
      }
      onSuccess();
      // Set saved event to prompt for WhatsApp invitation
      setSavedSuccessEvent(result || payload);
    } catch (err) {
      setError('Erro ao salvar o evento. Verifique os dados.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSavedSuccessEvent(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-[#16171d] border border-amber-600/70 rounded-2xl shadow-2xl overflow-hidden biker-border max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-950 via-[#1e1814] to-[#16171d] px-6 py-4 flex items-center justify-between border-b border-amber-950 flex-shrink-0">
          <div>
            <h2 className="text-base font-black uppercase text-white tracking-wider flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              {savedSuccessEvent 
                ? 'Convocação do Evento' 
                : (eventToEdit ? 'Editar Evento Oficial' : 'Cadastrar Novo Evento Oficial')}
            </h2>
            <p className="text-xs text-neutral-400 font-mono">
              {savedSuccessEvent 
                ? 'Divulgue o evento no WhatsApp com o link de confirmação' 
                : 'Os irmãos poderão confirmar presença assim que for postado'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success / WhatsApp Convocação View */}
        {savedSuccessEvent ? (
          <div className="p-6 space-y-4 overflow-y-auto">
            <div className="p-4 bg-emerald-950/60 border border-emerald-600/80 rounded-2xl text-center space-y-1.5">
              <span className="text-3xl">🎉</span>
              <h3 className="text-base font-black uppercase text-emerald-400 tracking-wider">
                {eventToEdit ? 'Evento Atualizado com Sucesso!' : 'Evento Publicado com Sucesso!'}
              </h3>
              <p className="text-xs text-neutral-300">
                O evento <strong>"{savedSuccessEvent.title}"</strong> já está ativo no sistema.
              </p>
            </div>

            <div className="bg-[#121318] border border-neutral-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5 uppercase">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  Convocação Oficial para os Irmãos
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-mono">
                  Link Render Configurado
                </span>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed">
                Envie o aviso no grupo do WhatsApp chamando todos os irmãos para confirmarem a presença pelo aplicativo ou pelo link:
              </p>

              <div className="p-3 bg-black/80 border border-neutral-800 rounded-xl font-mono text-[11px] text-neutral-200 max-h-48 overflow-y-auto whitespace-pre-wrap select-all shadow-inner border-l-4 border-l-emerald-500">
                {generateEventInviteText(savedSuccessEvent, config)}
              </div>
            </div>

            {copiedInvite && (
              <div className="p-2.5 bg-emerald-950/90 border border-emerald-600 rounded-lg text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2 animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Mensagem de convocação copiada! Cole no WhatsApp.</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-bold uppercase tracking-wider transition"
              >
                Concluir e Fechar
              </button>

              <button
                type="button"
                onClick={async () => {
                  const text = generateEventInviteText(savedSuccessEvent, config);
                  await navigator.clipboard.writeText(text);
                  setCopiedInvite(true);
                  setTimeout(() => setCopiedInvite(false), 3000);
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2"
              >
                {copiedInvite ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copiedInvite ? 'Copiado!' : 'Copiar Texto'}
              </button>

              <button
                type="button"
                onClick={() => {
                  const text = generateEventInviteText(savedSuccessEvent, config);
                  openWhatsAppWithText(text);
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-black font-black rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/70"
              >
                <Share2 className="w-4 h-4" />
                <span>Abrir no WhatsApp</span>
              </button>
            </div>
          </div>
        ) : (
          /* Normal Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
            {error && (
              <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-red-200 text-xs">
                {error}
              </div>
            )}

            {/* Division Banner */}
            <div>
              <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                Cabeçalho da Divisão:
              </label>
              <input
                type="text"
                value={divisionHeader}
                onChange={(e) => setDivisionHeader(e.target.value)}
                placeholder="INSANOS M.C. – DIVISÃO MOGI GUAÇU"
                className="w-full px-3 py-2 bg-[#0c0d10] border border-neutral-700 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Event Title */}
            <div>
              <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                Nome do Evento: <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Aniversário Sub-Sede Campinas ou Bonde Regional"
                required
                className="w-full px-3 py-2 bg-[#0c0d10] border border-neutral-700 rounded-lg text-white text-sm font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Category and Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                  Categoria:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0c0d10] border border-neutral-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="Evento Oficial">Evento Oficial</option>
                  <option value="Bonde / Viagem">Bonde / Viagem</option>
                  <option value="Ação Social">Ação Social</option>
                  <option value="Reunião de Divisão">Reunião de Divisão</option>
                  <option value="Aniversário de Irmão">Aniversário de Irmão</option>
                  <option value="Encontro Regional">Encontro Regional</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                  Data do Evento: <span className="text-amber-500">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#0c0d10] border border-neutral-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Friendly Date Label */}
            <div>
              <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                Formatação da Data na Mensagem:
              </label>
              <input
                type="text"
                value={dateFormatted}
                onChange={(e) => setDateFormatted(e.target.value)}
                placeholder="Ex: Sábado – 21 de março de 2026"
                className="w-full px-3 py-2 bg-[#0c0d10] border border-neutral-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            {/* Time & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                  Horário:
                </label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="Ex: A partir das 09:00 ou Saída às 14h"
                  className="w-full px-3 py-2 bg-[#0c0d10] border border-neutral-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                  Local / Endereço / Ponto de Encontro:
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Sede Mogi Guaçu / Posto Shell"
                  className="w-full px-3 py-2 bg-[#0c0d10] border border-neutral-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                Programação / Detalhes do Evento:
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhes, bandas, pontos de parada, instruções para os irmãos..."
                className="w-full px-3 py-2 bg-[#0c0d10] border border-neutral-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500 resize-none font-sans"
              />
            </div>

            {/* Event Poster / Flyer Image (Optional) */}
            <div className="bg-[#111216] border border-neutral-800 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-amber-400 font-bold uppercase flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-amber-500" />
                  Cartaz / Imagem do Evento (Opcional):
                </label>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remover Imagem
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={imageUrl.startsWith('data:') ? 'Imagem carregada localmente' : imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="URL da imagem (ex: https://.../flyer.jpg)"
                  className="flex-1 px-3 py-2 bg-[#0c0d10] border border-neutral-700 rounded-lg text-white text-xs font-mono placeholder:text-neutral-600 focus:outline-none focus:border-amber-500"
                />
                <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-600 rounded-lg text-xs font-bold transition whitespace-nowrap">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Escolher do Aparelho</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Live Image Preview */}
              {imageUrl && (
                <div className="mt-2 relative rounded-xl overflow-hidden border border-amber-500/50 max-h-48 bg-black/60 flex items-center justify-center">
                  <img
                    src={imageUrl}
                    alt="Prévia do cartaz"
                    className="w-full max-h-48 object-cover"
                  />
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 border border-amber-500/40 text-[10px] text-amber-300 font-mono font-bold shadow">
                    ✓ Prévia do Cartaz
                  </span>
                </div>
              )}
            </div>

            {/* WhatsApp notice hint */}
            <div className="p-2.5 bg-emerald-950/30 border border-emerald-900/50 rounded-xl text-[11px] text-emerald-300/90 flex items-center gap-2">
              <Share2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>
                Ao publicar o evento, você poderá copiar e enviar a convocação para o WhatsApp com o link <strong>{RENDER_APP_URL}</strong>.
              </span>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-bold uppercase tracking-wider transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-black font-extrabold rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-950"
              >
                <Check className="w-4 h-4" />
                {submitting ? 'Salvando...' : (eventToEdit ? 'Salvar Alterações' : 'Publicar Evento')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
