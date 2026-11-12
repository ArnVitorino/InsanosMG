import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LoginModal } from './components/LoginModal';
import { CalendarView } from './components/CalendarView';
import { AttendanceView } from './components/AttendanceView';
import { RosterList } from './components/RosterList';
import { AdminPanel } from './components/AdminPanel';
import { EventModal } from './components/EventModal';
import { api } from './services/api';
import { AlertCircle, Shield, CheckCircle } from 'lucide-react';

export function App() {
  // Authentication State
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem('insanos_auth_role');
    return saved ? { role: saved } : { role: 'member' }; // Default to 'member' for instant smooth access or require prompt
  });
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

  // Load all initial data
  const fetchData = async () => {
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
    fetchData();
  }, []);

  // When selectedEventId changes, load its specific details
  useEffect(() => {
    if (!selectedEventId) return;
    api.getEventDetails(selectedEventId).then((details) => {
      setEventDetails(details);
    }).catch(err => console.error(err));
  }, [selectedEventId]);

  const handleLoginSuccess = ({ role }) => {
    setAuth({ role });
    localStorage.setItem('insanos_auth_role', role);
    if (role === 'admin') {
      setActiveTab('admin');
    }
  };

  const handleLogout = () => {
    setAuth({ role: null });
    localStorage.removeItem('insanos_auth_role');
    setShowLoginModal(true);
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

  return (
    <div className="min-h-screen bg-[#0b0c0e] text-neutral-100 flex flex-col font-sans selection:bg-red-700 selection:text-white relative">
      {/* Background Oficial Insanos M.C. Divisão Mogi Guaçu */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 sm:opacity-25 filter contrast-125"
          style={{ backgroundImage: "url('/bg-insanos.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0c0e]/90 via-[#0b0c0e]/80 to-[#0b0c0e]/95" />
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
              <p className="text-sm font-mono text-red-400 uppercase tracking-widest">
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
            <div className="flex items-center gap-2 text-red-500 font-bold uppercase tracking-widest text-sm">
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
              Sistema de Confirmação de Presença e Escalas de Eventos
            </p>
          </div>
        </footer>
      </div>

      {/* Modals */}

      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
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
