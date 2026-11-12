import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock, Users, Plus, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export function CalendarView({ 
  events, 
  onSelectEvent, 
  onOpenCreateEvent, 
  auth 
}) {
  const [currentDate, setCurrentDate] = useState(() => {
    if (events && events.length > 0 && events[0].date) {
      const parts = events[0].date.split('-');
      if (parts.length >= 2) {
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
      }
    }
    return new Date(2026, 10, 1);
  });

  const [selectedDateStr, setSelectedDateStr] = useState(() => {
    return (events && events.length > 0) ? events[0].date : '2026-11-14';
  });

  useEffect(() => {
    if (events && events.length > 0) {
      const firstEvent = events[0];
      if (firstEvent.date) {
        setSelectedDateStr(firstEvent.date);
        const parts = firstEvent.date.split('-');
        if (parts.length >= 2) {
          setCurrentDate(new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1));
        }
      }
    }
  }, [events]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Calculate days in month
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Map events to date strings "YYYY-MM-DD"
  const eventsByDate = {};
  events.forEach(ev => {
    if (ev.date) {
      if (!eventsByDate[ev.date]) eventsByDate[ev.date] = [];
      eventsByDate[ev.date].push(ev);
    }
  });

  // Calendar cells
  const calendarCells = [];
  // Prev month padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    calendarCells.push({
      day: dayNum,
      isCurrentMonth: false,
      dateStr: null
    });
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(d).padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${dayStr}`;
    calendarCells.push({
      day: d,
      isCurrentMonth: true,
      dateStr,
      hasEvents: Boolean(eventsByDate[dateStr]?.length),
      events: eventsByDate[dateStr] || []
    });
  }
  // Next month padding
  const totalSlots = Math.ceil(calendarCells.length / 7) * 7;
  const nextMonthSlots = totalSlots - calendarCells.length;
  for (let i = 1; i <= nextMonthSlots; i++) {
    calendarCells.push({
      day: i,
      isCurrentMonth: false,
      dateStr: null
    });
  }

  // Events on selected date (or all if none selected)
  const selectedDayEvents = selectedDateStr ? (eventsByDate[selectedDateStr] || []) : [];

  return (
    <div className="space-y-6">
      {/* Calendar Header with Title and Month Switcher */}
      <div className="bg-[#14151a] border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-xl biker-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-red-500" />
              Calendário de Eventos & Encontros
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Acompanhe as datas oficiais, encontros e responsabilidades da diretoria
            </p>
          </div>

          <div className="flex items-center gap-3">
            {auth.role === 'admin' && (
              <button
                onClick={() => onOpenCreateEvent(selectedDateStr)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-md shadow-red-950"
              >
                <Plus className="w-4 h-4" />
                Novo Evento
              </button>
            )}

            <div className="flex items-center bg-[#0d0e12] border border-neutral-700 rounded-lg p-1">
              <button
                onClick={prevMonth}
                className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-xs font-bold text-neutral-200 tracking-wider uppercase min-w-[130px] text-center font-mono">
                {monthNames[month]} {year}
              </span>
              <button
                onClick={nextMonth}
                className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center py-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-800/60">
          {daysOfWeek.map((day, idx) => (
            <div key={day} className={idx === 0 || idx === 6 ? 'text-red-400/80' : ''}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 pt-2">
          {calendarCells.map((cell, idx) => {
            if (!cell.isCurrentMonth) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[64px] md:min-h-[84px] p-1.5 rounded-lg bg-neutral-950/30 text-neutral-700 text-xs font-mono select-none"
                >
                  <span>{cell.day}</span>
                </div>
              );
            }

            const isSelected = cell.dateStr === selectedDateStr;
            const hasEv = cell.hasEvents;

            return (
              <div
                key={cell.dateStr}
                onClick={() => setSelectedDateStr(cell.dateStr)}
                className={`min-h-[64px] md:min-h-[84px] p-1.5 rounded-xl cursor-pointer transition flex flex-col justify-between border ${
                  isSelected
                    ? 'bg-red-950/40 border-red-500 shadow-md shadow-red-950/60'
                    : hasEv
                    ? 'bg-neutral-900 border-red-900/60 hover:border-red-600'
                    : 'bg-[#0e0f13] border-neutral-800/80 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono font-bold ${
                      isSelected
                        ? 'text-red-400 font-black'
                        : hasEv
                        ? 'text-white'
                        : 'text-neutral-400'
                    }`}
                  >
                    {cell.day}
                  </span>
                  {hasEv && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  )}
                </div>

                {/* Event tags in cell */}
                <div className="space-y-1 mt-1 overflow-hidden">
                  {cell.events.map((ev) => (
                    <div
                      key={ev.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(ev.id);
                      }}
                      className="text-[10px] truncate px-1.5 py-0.5 rounded bg-red-900/80 text-red-200 border border-red-700 font-medium hover:bg-red-800"
                      title={ev.title}
                    >
                      🏍️ {ev.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Event Details or Upcoming List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            {selectedDateStr ? `Eventos na Data Selecionada (${selectedDateStr})` : 'Todos os Eventos'}
          </h3>
          <span className="text-xs text-neutral-500 font-mono">
            {selectedDayEvents.length} {selectedDayEvents.length === 1 ? 'evento' : 'eventos'}
          </span>
        </div>

        {selectedDayEvents.length === 0 ? (
          <div className="p-8 text-center bg-[#131418] border border-neutral-800/80 rounded-2xl">
            <CalendarIcon className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-neutral-400">
              Nenhum evento agendado para esta data.
            </p>
            {auth.role === 'admin' && (
              <button
                onClick={() => onOpenCreateEvent(selectedDateStr)}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-700 transition"
              >
                <Plus className="w-3.5 h-3.5 text-red-400" />
                Agendar Evento neste dia
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedDayEvents.map((ev) => (
              <div
                key={ev.id}
                className="bg-[#15161c] border border-red-950/70 rounded-2xl p-5 shadow-xl hover:border-red-700/80 transition biker-border flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800/50 font-mono uppercase tracking-wider">
                      {ev.category || 'Evento Oficial'}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">
                      {ev.status === 'active' ? '🟢 Ativo' : '⚪ Concluído'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base md:text-lg font-black text-white tracking-wide uppercase">
                      {ev.title}
                    </h4>
                    <p className="text-xs text-red-400/90 font-mono">
                      {ev.divisionHeader}
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs text-neutral-300">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                      <span>{ev.dateFormatted || ev.date}</span>
                    </div>
                    {ev.time && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                        <span>{ev.time}</span>
                      </div>
                    )}
                    {ev.location && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
                        <span>{ev.location}</span>
                      </div>
                    )}
                  </div>

                  {ev.description && (
                    <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800/80 text-xs text-neutral-300 whitespace-pre-line">
                      {ev.description}
                    </div>
                  )}

                  {/* Attendance Stats bar */}
                  {ev.stats && (
                    <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs font-mono">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {ev.stats.yesCount} Sim
                      </span>
                      <span className="flex items-center gap-1 text-red-400">
                        <XCircle className="w-3.5 h-3.5" />
                        {ev.stats.noCount} Não
                      </span>
                      <span className="flex items-center gap-1 text-amber-400">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {ev.stats.maybeCount + ev.stats.pendingCount} Pendentes
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-2">
                  <button
                    onClick={() => onSelectEvent(ev.id)}
                    className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-md shadow-red-950"
                  >
                    <Users className="w-4 h-4" />
                    Abrir Chamada & Confirmar Presença
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Upcoming Events Section */}
      <div className="space-y-3 pt-4 border-t border-neutral-800">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-neutral-500" />
          Todos os Próximos Eventos Cadastrados
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {events.map((ev) => (
            <div
              key={ev.id}
              onClick={() => onSelectEvent(ev.id)}
              className="p-4 bg-[#111216] border border-neutral-800/90 rounded-xl hover:border-red-700/60 transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono text-red-400 uppercase">
                  {ev.dateFormatted || ev.date}
                </span>
                <h4 className="text-sm font-bold text-white uppercase mt-0.5 truncate">
                  {ev.title}
                </h4>
                <p className="text-xs text-neutral-400 truncate mt-1">
                  📍 {ev.location || 'Local a definir'}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                <span>{ev.stats ? `${ev.stats.yesCount} confirmados` : ''}</span>
                <span className="text-red-400 font-bold">Ver lista →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
