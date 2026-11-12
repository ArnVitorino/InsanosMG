import React, { useState, useEffect } from 'react';
import { ShieldAlert, Plus, Trash2, Edit2, ArrowUp, ArrowDown, Save, Calendar, Users, Settings, Key, Check, X, Database, Cloud, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export function AdminPanel({ 
  events, 
  members, 
  config, 
  onRefresh, 
  onOpenCreateEvent, 
  onEditEvent, 
  initialDateForNewEvent 
}) {
  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'members' | 'settings'

  // Member Management State
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberNickname, setNewMemberNickname] = useState('');
  const [editingMember, setEditingMember] = useState(null);
  const [editName, setEditName] = useState('');
  const [editNickname, setEditNickname] = useState('');
  const [savingMember, setSavingMember] = useState(false);

  // Settings State
  const [clubName, setClubName] = useState(config.clubName || 'INSANOS M.C.');
  const [division, setDivision] = useState(config.division || 'DIVISÃO MOGI GUAÇU');
  const [motto, setMotto] = useState(config.motto || 'SOMOS DE VERDADE');
  const [currentAdminPass, setCurrentAdminPass] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [configMsg, setConfigMsg] = useState(null);
  const [dbStatus, setDbStatus] = useState(null);
  const [loadingDbStatus, setLoadingDbStatus] = useState(false);

  const fetchDbStatus = async () => {
    setLoadingDbStatus(true);
    try {
      const res = await api.getStatus();
      setDbStatus(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDbStatus(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'settings') {
      fetchDbStatus();
    }
  }, [activeTab]);

  // Handlers for Members
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    setSavingMember(true);
    try {
      await api.addMember({
        name: newMemberName.trim(),
        nickname: newMemberNickname.trim()
      });
      setNewMemberName('');
      setNewMemberNickname('');
      onRefresh();
    } catch (err) {
      alert('Erro ao adicionar integrante.');
    } finally {
      setSavingMember(false);
    }
  };

  const handleSaveEditMember = async (e) => {
    e.preventDefault();
    if (!editingMember || !editName.trim()) return;

    try {
      await api.updateMember(editingMember.id, {
        name: editName.trim(),
        nickname: editNickname.trim()
      });
      setEditingMember(null);
      onRefresh();
    } catch (err) {
      alert('Erro ao atualizar integrante.');
    }
  };

  const handleDeleteMember = async (member) => {
    if (!window.confirm(`Tem certeza que deseja remover o integrante "${member.name}" da lista?`)) {
      return;
    }

    try {
      await api.deleteMember(member.id);
      onRefresh();
    } catch (err) {
      alert('Erro ao excluir integrante.');
    }
  };

  const handleMoveMember = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= members.length) return;

    const newMembers = [...members];
    const [moved] = newMembers.splice(index, 1);
    newMembers.splice(targetIndex, 0, moved);

    const orderedIds = newMembers.map(m => m.id);
    try {
      await api.reorderMembers(orderedIds);
      onRefresh();
    } catch (err) {
      console.error('Erro ao reordenar:', err);
    }
  };

  // Handlers for Events
  const handleDeleteEvent = async (event) => {
    if (!window.confirm(`Tem certeza que deseja excluir o evento "${event.title}"?`)) {
      return;
    }

    try {
      await api.deleteEvent(event.id);
      onRefresh();
    } catch (err) {
      alert('Erro ao excluir evento.');
    }
  };

  // Handlers for Config & Password
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    try {
      await api.updateConfig({ clubName, division, motto });
      setConfigMsg({ type: 'success', text: 'Configurações do clube atualizadas com sucesso!' });
      onRefresh();
      setTimeout(() => setConfigMsg(null), 3500);
    } catch (err) {
      setConfigMsg({ type: 'error', text: 'Erro ao atualizar configurações.' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentAdminPass || !newAdminPass) return;

    try {
      const res = await api.changeAdminPassword(currentAdminPass, newAdminPass);
      if (res.success) {
        setPasswordMsg({ type: 'success', text: 'Senha de Administrador alterada com sucesso!' });
        setCurrentAdminPass('');
        setNewAdminPass('');
        setTimeout(() => setPasswordMsg(null), 3500);
      } else {
        setPasswordMsg({ type: 'error', text: res.message || 'Erro ao alterar senha.' });
      }
    } catch (err) {
      setPasswordMsg({ type: 'error', text: 'Erro ao conectar ao servidor.' });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-[#1e1713] to-[#14151a] border border-amber-600/60 rounded-2xl p-5 shadow-2xl biker-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-500 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-wider">
              Painel da Diretoria (Admin)
            </h2>
            <p className="text-xs text-amber-300 font-mono">
              Controle total de eventos, integrantes e configurações
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#121318] border border-neutral-800 rounded-xl">
        <button
          onClick={() => setActiveTab('events')}
          className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeTab === 'events'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-950'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Eventos ({events.length})
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeTab === 'members'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-950'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Integrantes ({members.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeTab === 'settings'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-950'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          Configurações
        </button>
      </div>

      {/* TAB 1: EVENTS */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-300">
              Gerenciar Eventos Postados
            </h3>
            <button
              onClick={() => onOpenCreateEvent()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-md shadow-red-950"
            >
              <Plus className="w-4 h-4" />
              Novo Evento
            </button>
          </div>

          <div className="space-y-3">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="bg-[#14151a] border border-neutral-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-neutral-700 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-white uppercase">{ev.title}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono">
                      {ev.dateFormatted || ev.date}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 truncate max-w-xl">
                    📍 {ev.location || 'Local não informado'} {ev.time ? `• ⏰ ${ev.time}` : ''}
                  </p>
                  {ev.stats && (
                    <p className="text-[11px] text-neutral-500 font-mono mt-1">
                      {ev.stats.yesCount} Sim • {ev.stats.noCount} Não • {ev.stats.pendingCount} Pendentes
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => onEditEvent(ev)}
                    className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs flex items-center gap-1 border border-neutral-700 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(ev)}
                    className="p-2 bg-neutral-800 hover:bg-red-900/60 text-red-400 rounded-lg text-xs flex items-center gap-1 border border-neutral-700 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MEMBERS */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          {/* Add member form */}
          <div className="bg-[#14151a] border border-neutral-800 rounded-xl p-4 biker-border">
            <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              Adicionar Novo Integrante à Divisão
            </h4>
            <form onSubmit={handleAddMember} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Nome do Irmão (ex: Beto)"
                className="px-3 py-2 bg-[#0c0d10] border border-neutral-700 rounded-lg text-white text-xs"
              />
              <input
                type="text"
                value={newMemberNickname}
                onChange={(e) => setNewMemberNickname(e.target.value)}
                placeholder="Apelido / Colete (opcional)"
                className="px-3 py-2 bg-[#0c0d10] border border-neutral-700 rounded-lg text-white text-xs"
              />
              <button
                type="submit"
                disabled={savingMember}
                className="py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition"
              >
                {savingMember ? 'Salvando...' : 'Adicionar Integrante'}
              </button>
            </form>
          </div>

          {/* Members list with reorder and delete */}
          <div className="bg-[#14151a] border border-neutral-800 rounded-xl p-4 biker-border space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-xs font-mono text-neutral-400 uppercase">
              <span>Integrantes ({members.length})</span>
              <span>Posição & Ações</span>
            </div>

            <div className="divide-y divide-neutral-800/80">
              {members.map((member, index) => {
                const isEditing = editingMember?.id === member.id;

                if (isEditing) {
                  return (
                    <form
                      key={member.id}
                      onSubmit={handleSaveEditMember}
                      className="py-2.5 flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="px-2.5 py-1.5 bg-[#0c0d10] border border-neutral-700 rounded text-xs text-white flex-1"
                      />
                      <input
                        type="text"
                        value={editNickname}
                        onChange={(e) => setEditNickname(e.target.value)}
                        placeholder="Apelido"
                        className="px-2.5 py-1.5 bg-[#0c0d10] border border-neutral-700 rounded text-xs text-white w-28"
                      />
                      <button
                        type="submit"
                        className="p-1.5 bg-emerald-600 text-white rounded text-xs"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingMember(null)}
                        className="p-1.5 bg-neutral-800 text-neutral-400 rounded text-xs"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </form>
                  );
                }

                return (
                  <div
                    key={member.id}
                    className="py-2 flex items-center justify-between gap-3 hover:bg-neutral-900/40 rounded-lg px-2 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-400 flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                      <span className="text-xs font-bold text-white">
                        {member.name}
                      </span>
                      {member.nickname && (
                        <span className="text-[11px] text-neutral-400 font-mono">
                          "{member.nickname}"
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Reorder Up */}
                      <button
                        onClick={() => handleMoveMember(index, -1)}
                        disabled={index === 0}
                        title="Mover para cima"
                        className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Reorder Down */}
                      <button
                        onClick={() => handleMoveMember(index, 1)}
                        disabled={index === members.length - 1}
                        title="Mover para baixo"
                        className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => {
                          setEditingMember(member);
                          setEditName(member.name);
                          setEditNickname(member.nickname || '');
                        }}
                        title="Editar nome"
                        className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 ml-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteMember(member)}
                        title="Remover integrante"
                        className="p-1 rounded bg-neutral-800 hover:bg-red-950 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Cloud Database Status */}
          <div className="bg-[#14151a] border border-neutral-800 rounded-xl p-5 biker-border space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-400" />
                Status do Banco de Dados & Nuvem
              </h4>
              <button
                onClick={fetchDbStatus}
                disabled={loadingDbStatus}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
                title="Atualizar status"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingDbStatus ? 'animate-spin text-amber-400' : ''}`} />
              </button>
            </div>

            <div className="p-4 bg-[#0c0d10] border border-neutral-800 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${dbStatus?.isCloudDatabase ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]'}`} />
                  <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                    {dbStatus?.storageLabel || 'Verificando...'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1 max-w-xl leading-relaxed">
                  {dbStatus?.isCloudDatabase 
                    ? '✅ Banco de dados em nuvem ativo! Os dados de confirmação e escala ficam salvos 24 horas por dia.' 
                    : '⚠️ Operando em modo local. Para colocar o app na Vercel e manter online 24h gratuitamente, adicione a variável de conexão (MongoDB Atlas, Supabase ou Neon).'}
                </p>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 text-[11px] font-mono text-neutral-400 border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-800 w-full sm:w-auto justify-between sm:justify-start">
                <span className="text-neutral-300 font-bold">{members.length} Integrantes</span>
                <span className="text-neutral-300 font-bold">{events.length} Eventos</span>
              </div>
            </div>
          </div>

          {/* Club Info */}
          <form onSubmit={handleSaveConfig} className="bg-[#14151a] border border-neutral-800 rounded-xl p-5 biker-border space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Settings className="w-4 h-4" />
              Identidade do Clube & Divisão
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                  Nome do Motoclube:
                </label>
                <input
                  type="text"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0c0d10] border border-neutral-700 rounded-lg text-white text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                  Nome da Divisão:
                </label>
                <input
                  type="text"
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0c0d10] border border-neutral-700 rounded-lg text-white text-xs font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                  Lema Oficial (Rodapé):
                </label>
                <input
                  type="text"
                  value={motto}
                  onChange={(e) => setMotto(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0c0d10] border border-neutral-700 rounded-lg text-white text-xs font-bold"
                />
              </div>
            </div>

            {configMsg && (
              <p className={`text-xs ${configMsg.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                {configMsg.text}
              </p>
            )}

            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Salvar Alterações
            </button>
          </form>

          {/* Change Admin Password */}
          <form onSubmit={handleChangePassword} className="bg-[#14151a] border border-neutral-800 rounded-xl p-5 biker-border space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Key className="w-4 h-4" />
              Alterar Senha do Administrador (Diretoria)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                  Senha Atual:
                </label>
                <input
                  type="password"
                  value={currentAdminPass}
                  onChange={(e) => setCurrentAdminPass(e.target.value)}
                  placeholder="Senha atual"
                  className="w-full px-3 py-2 bg-[#0c0d10] border border-neutral-700 rounded-lg text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                  Nova Senha:
                </label>
                <input
                  type="password"
                  value={newAdminPass}
                  onChange={(e) => setNewAdminPass(e.target.value)}
                  placeholder="Nova senha (mínimo 4 caracteres)"
                  className="w-full px-3 py-2 bg-[#0c0d10] border border-neutral-700 rounded-lg text-white text-xs"
                />
              </div>
            </div>

            {passwordMsg && (
              <p className={`text-xs ${passwordMsg.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                {passwordMsg.text}
              </p>
            )}

            <button
              type="submit"
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-bold uppercase tracking-wider transition border border-neutral-700"
            >
              Atualizar Senha
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

