const API_BASE = '/api';

export const api = {
  // Auth
  loginMember: async (password) => {
    const res = await fetch(`${API_BASE}/auth/member`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    return res.json();
  },

  loginAdmin: async (password) => {
    const res = await fetch(`${API_BASE}/auth/admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    return res.json();
  },

  changeAdminPassword: async (currentPassword, newPassword) => {
    const res = await fetch(`${API_BASE}/auth/change-admin-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return res.json();
  },

  // Config
  getConfig: async () => {
    const res = await fetch(`${API_BASE}/config`);
    return res.json();
  },

  updateConfig: async (config) => {
    const res = await fetch(`${API_BASE}/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return res.json();
  },

  // Members
  getMembers: async () => {
    const res = await fetch(`${API_BASE}/members`);
    return res.json();
  },

  addMember: async (member) => {
    const res = await fetch(`${API_BASE}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member)
    });
    return res.json();
  },

  updateMember: async (id, member) => {
    const res = await fetch(`${API_BASE}/members/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member)
    });
    return res.json();
  },

  deleteMember: async (id) => {
    const res = await fetch(`${API_BASE}/members/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  reorderMembers: async (orderedIds) => {
    const res = await fetch(`${API_BASE}/members/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds })
    });
    return res.json();
  },

  // Events
  getEvents: async () => {
    const res = await fetch(`${API_BASE}/events`);
    return res.json();
  },

  getEventDetails: async (id) => {
    const res = await fetch(`${API_BASE}/events/${id}`);
    return res.json();
  },

  createEvent: async (eventData) => {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    return res.json();
  },

  updateEvent: async (id, eventData) => {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    return res.json();
  },

  deleteEvent: async (id) => {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Attendances
  submitAttendance: async (eventId, memberId, status, reason = '') => {
    const res = await fetch(`${API_BASE}/events/${eventId}/attend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, status, reason })
    });
    return res.json();
  },

  getWhatsAppText: async (eventId) => {
    const res = await fetch(`${API_BASE}/events/${eventId}/whatsapp`);
    return res.json();
  }
};
