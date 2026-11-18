import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LoginModal } from './components/LoginModal';
import { CalendarView } from './components/CalendarView';
import { AttendanceView } from './components/AttendanceView';
import { RosterList } from './components/RosterList';
import { GalleryView } from './components/GalleryView';
import { AdminPanel } from './components/AdminPanel';
import { EventModal } from './components/EventModal';
import { api } from './services/api';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function getInitialAuth() {
  try {
    const savedRole = localStorage.getItem('insanos_auth_role');
    const expiresAtStr = localStorage.getItem('insanos_auth_expires_at');

    if (!savedRole || !expiresAtStr) {
      return { role: null };
    }

    const expiresAt = parseInt(expiresAtStr, 10);
    const now = Date.now();

    if (isNaN(expiresAt) || now >= expiresAt) {
      localStorage.removeItem('insanos_auth_role');
      localStorage.removeItem('insanos_auth_expires_at');
      return { role: null };
    }

    return { role: savedRole };
  } catch (e) {
    return { role: null };
  }
}

export function App() {
  // Authentication State with 7-day expiration
  const [auth, setAuth] = useState(getInitialAuth);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // App Data State
  const [config, setConfig] = useState({
    clubName: 'INSANOS M.C.',
    division: 'DIVISÃO MOGI GUAÇU',
    motto: 'SOMOS DE VERDADE'
  });
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('calendar'); // Calendário como página inicial!
  const [loading, setLoading] = useState(true);

  // Event Modal State
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [initialDateForNewEvent, setInitialDateForNewEvent] = useState(null);

  // Fetch basic config for branding on mount
  useEffect(() => {
    api.getConfig().then(cfg => {
      if (cfg && cfg.clubName) setConfig(cfg);
    }).catch(err => console.error('Erro ao buscar config:', err));
  }, []);

  // Load all initial data once authenticated
  const fetchData = async () => {
    setLoading(true);
    try {
      const [cfg, mems, evs] = await Promise.all([
        api.getConfig(),
        api.getMembers(),
        api.getEvents()
      ]);

      setConfig(cfg);
      setMembers(mems);
      setEvents(evs);

      // Default to first active event or existing selectedEventId
      const targetId = selectedEventId || (evs.length > 0 ? evs[0].id : null);
      if (targetId) {
        setSelectedEventId(targetId);
        const details = await api.getEventDetails(targetId);
        setEventDetails(details);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.role) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [auth.role]);

  // When selectedEventId changes, load its specific details
  useEffect(() => {
    if (!selectedEventId || !auth.role) return;
    api.getEventDetails(selectedEventId).then((details) => {
      setEventDetails(details);
    }).catch(err => console.error(err));
  }, [selectedEventId, auth.role]);

  const handleLoginSuccess = ({ role }) => {
    const expiresAt = Date.now() + SEVEN_DAYS_MS;
    localStorage.setItem('insanos_auth_role', role);
    localStorage.setItem('insanos_auth_expires_at', String(expiresAt));
    setAuth({ role });
    setShowLoginModal(false);
    if (role === 'admin') {
      setActiveTab('admin');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('insanos_auth_role');
    localStorage.removeItem('insanos_auth_expires_at');
    setAuth({ role: null });
    setActiveTab('calendar');
  };

  const handleOpenCreateEvent = (dateStr = null) => {
    setEventToEdit(null);
    setInitialDateForNewEvent(dateStr);
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (event) => {
    setEventToEdit(event);
    setIsEventModalOpen(true);
  };

  const handleSelectEventFromCalendar = (eventId) => {
    setSelectedEventId(eventId);
    setActiveTab('attend');
  };

  // Se o usuário não estiver autenticado (não logado ou sessão de 7 dias expirada),
  // exibe diretamente a Tela Inicial de Senha obrigatória com a imagem de fundo em destaque!
  if (!auth.role) {
    return (
      <div className="min-h-screen bg-[#0b0c0e] text-neutral-100 flex flex-col items-center justify-center font-sans selection:bg-amber-600 selection:text-black relative">
        {/* Background Oficial Insanos M.C. Divisão Mogi Guaçu em alta visibilidade */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Versão Widescreen (Desktop/Tablet) */}
          <div 
            className="hidden md:block absolute inset-0 bg-cover bg-center bg-no-repeat opacity-95 filter contrast-110 brightness-105"
            style={{ backgroundImage: "url('/bg-insanos-wide.jpg')" }}
          />
          {/* Versão Vertical (Mobile) */}
          <div 
            className="md:hidden absolute inset-0 bg-cover bg-center bg-no-repeat opacity-95 filter contrast-110 brightness-105"
            style={{ backgroundImage: "url('/bg-insanos.jpg')" }}
          />
          {/* Vinheta leve apenas para garantir contraste nas bordas */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
        </div>

        {/* Portão Frontal de Login Obrigatório */}
        <LoginModal
          isOpen={true}
          isMandatory={true}
          config={config}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0c0e] text-neutral-100 flex flex-col font-sans selection:bg-amber-600 selection:text-black relative">
      {/* Background Oficial Insanos M.C. Divisão Mogi Guaçu */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Versão Horizontal Widescreen em Computador/Tablet (md+) */}
        <div 
          className="hidden md:block absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80 filter contrast-110 brightness-105"
          style={{ backgroundImage: "url('/bg-insanos-wide.jpg')" }}
        />
        {/* Versão Vertical em Celular (mobile) para encaixe perfeito em pé */}
        <div 
          className="md:hidden absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80 filter contrast-110 brightness-105"
          style={{ backgroundImage: "url('/bg-insanos.jpg')" }}
        />
        {/* Vinheta suave para integração elegante com o conteúdo */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0c10]/45 via-transparent to-[#0b0c10]/70" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <Header
          auth={auth}
          config={config}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenLogin={() => setShowLoginModal(true)}
          onLogout={handleLogout}
          onOpenAdminSettings={() => {
            if (auth.role === 'admin') setActiveTab('admin');
          }}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-[1500px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
              <span className="text-4xl animate-bounce">☠️</span>
              <p className="text-sm font-mono text-amber-400 uppercase tracking-widest">
                Carregando dados da Divisão...
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'calendar' && (
                <CalendarView
                  events={events}
                  onSelectEvent={handleSelectEventFromCalendar}
                  onOpenCreateEvent={handleOpenCreateEvent}
                  auth={auth}
                />
              )}

              {activeTab === 'attend' && (
                <AttendanceView
                  events={events}
                  selectedEventId={selectedEventId}
                  onSelectEvent={(id) => setSelectedEventId(id)}
                  members={members}
                  eventDetails={eventDetails}
                  onRefresh={fetchData}
                  onOpenRosterTab={() => setActiveTab('roster')}
                  onOpenPhotosTab={() => setActiveTab('photos')}
                />
              )}

              {activeTab === 'roster' && (
                <RosterList
                  events={events}
                  selectedEventId={selectedEventId}
                  onSelectEvent={(id) => setSelectedEventId(id)}
                  eventDetails={eventDetails}
                  onRefresh={fetchData}
                  auth={auth}
                />
              )}

              {activeTab === 'photos' && (
                <GalleryView
                  events={events}
                  selectedEventId={selectedEventId}
                  onSelectEvent={(id) => setSelectedEventId(id)}
                  members={members}
                  auth={auth}
                />
              )}

              {activeTab === 'admin' && auth.role === 'admin' && (
                <AdminPanel
                  events={events}
                  members={members}
                  config={config}
                  onRefresh={fetchData}
                  onOpenCreateEvent={handleOpenCreateEvent}
                  onEditEvent={handleEditEvent}
                />
              )}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-[#090a0d]/90 backdrop-blur-sm border-t border-neutral-900 py-6 text-center text-xs text-neutral-500 font-mono tracking-wider mt-auto">
          <div className="max-w-6xl mx-auto px-4 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-widest text-sm">
              <span>☠️</span>
              <span>{config.clubName}</span>
              <span>–</span>
              <span>{config.division}</span>
              <span>☠️</span>
            </div>
            <p className="text-neutral-400 font-bold">
              "{config.motto}"
            </p>
            <p className="text-[11px] text-neutral-600 mt-1">
              Sistema de Confirmação de Presença e Escalas de Eventos • <span className="text-amber-500/80 font-bold">v1.0</span>
            </p>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
        isMandatory={false}
        config={config}
      />

      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        eventToEdit={eventToEdit}
        config={config}
        initialDate={initialDateForNewEvent}
        onSuccess={fetchData}
      />
    </div>
  );
}

export default App;
