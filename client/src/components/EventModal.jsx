import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, AlignLeft, Check, Image as ImageIcon, Upload, Trash2 } from 'lucide-react';
import { api } from '../services/api';

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
      if (eventToEdit) {
        await api.updateEvent(eventToEdit.id, payload);
      } else {
        await api.createEvent(payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError('Erro ao salvar o evento. Verifique os dados.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-[#16171d] border border-amber-600/70 rounded-2xl shadow-2xl overflow-hidden biker-border max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-950 via-[#1e1814] to-[#16171d] px-6 py-4 flex items-center justify-between border-b border-amber-950 flex-shrink-0">
          <div>
            <h2 className="text-base font-black uppercase text-white tracking-wider flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              {eventToEdit ? 'Editar Evento Oficial' : 'Cadastrar Novo Evento Oficial'}
            </h2>
            <p className="text-xs text-neutral-400 font-mono">
              Os irmãos poderão confirmar presença assim que for postado
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-950/70 border border-red-800 rounded-xl text-red-200 text-xs">
              {error}
            </div>
          )}

          {/* Division Header */}
          <div>
            <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
              Cabeçalho da Divisão:
            </label>
            <input
              type="text"
              value={divisionHeader}
              onChange={(e) => setDivisionHeader(e.target.value)}
              placeholder="INSANOS M.C. – DIVISÃO MOGI GUAÇU"
              className="w-full px-3 py-2 bg-[#0c0d10] border border-neutral-700 rounded-lg text-white text-xs font-mono font-bold"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
              Nome do Evento: *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: 1º Insanos Fest – Extrema/MG"
              required
              className="w-full px-3 py-2 bg-[#0c0d10] border border-neutral-700 rounded-lg text-white text-sm font-bold"
            />
          </div>

          {/* Date & Formatted Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                Data do Evento (Calendário): *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#0c0d10] border border-neutral-700 rounded-lg text-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                Horário:
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="Ex: A partir das 14:00"
                className="w-full px-3 py-2 bg-[#0c0d10] border border-neutral-700 rounded-lg text-white text-xs"
              />
            </div>
          </div>

          {/* Text formatted Date */}
          <div>
            <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
              Data Formatada para o WhatsApp:
            </label>
            <input
              type="text"
              value={dateFormatted}
              onChange={(e) => setDateFormatted(e.target.value)}
              placeholder="Ex: Sábado – 14 de novembro de 2026"
              className="w-full px-3 py-2 bg-[#0c0d10] border border-neutral-700 rounded-lg text-white text-xs font-mono"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
              Local:
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Vila Mineira Open Mall e Gastronomia - Extrema/MG"
              className="w-full px-3 py-2 bg-[#0c0d10] border border-neutral-700 rounded-lg text-white text-xs"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
              Categoria:
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-[#0c0d10] border border-neutral-700 rounded-lg text-white text-xs"
            >
              <option value="Evento Oficial">Evento Oficial</option>
              <option value="Rolezinho / Bonde">Rolezinho / Bonde</option>
              <option value="Ação Social">Ação Social</option>
              <option value="Reunião de Diretoria">Reunião de Diretoria</option>
              <option value="Sede / Almoço">Sede / Almoço</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
              Programação / Detalhes:
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Encontro de Motoclubes + Festival de Rock..."
              className="w-full px-3 py-2 bg-[#0c0d10] border border-neutral-700 rounded-lg text-white text-xs"
            />
          </div>

          {/* Event Image / Cartaz (Opcional) */}
          <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-mono text-amber-400 uppercase font-bold flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                Imagem / Cartaz do Evento (Opcional):
              </label>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="text-[11px] text-red-400 hover:text-red-300 font-mono flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3 h-3" />
                  Remover Foto
                </button>
              )}
            </div>

            <p className="text-[11px] text-neutral-400">
              Caso adicione, a imagem aparecerá no topo da página de confirmação de presença dos irmãos.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Cole o link da foto (https://...) ou escolha um arquivo..."
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

          {/* Buttons */}
          <div className="flex gap-2 pt-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
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
      </div>
    </div>
  );
}

