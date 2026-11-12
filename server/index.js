require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { getDb, saveDb, getActiveStorageType, getStorageLabel } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Helper function to format WhatsApp text
function generateWhatsAppText(event, members) {
  const dateStr = event.dateFormatted || event.date;
  let text = `${event.divisionHeader || "INSANOS M.C. – DIVISÃO MOGI GUAÇU"}\n\n`;
  text += `${event.title}\n\n`;
  if (dateStr) text += `🗓️ Data: ${dateStr}\n`;
  if (event.time) text += `⏰ Horário: ${event.time}\n`;
  if (event.location) text += `\n📍 Local:\n${event.location}\n`;
  if (event.description) text += `\n🎸 Evento:\n${event.description}\n`;
  
  text += `\n⸻\n\n`;
  text += `Confirme sua presença respondendo:\n\n`;
  text += `✅ Eu vou.\n`;
  text += `❌ Não vou. (informar o motivo)\n`;
  text += `⚠️ Ainda não sei. (confirmo em breve)\n\n`;
  text += `⸻\n\n`;
  text += `Lista:\n\n`;

  const attendances = event.attendances || {};
  const activeMembers = members.filter(m => m.active !== false);

  activeMembers.forEach((member, index) => {
    const num = index + 1;
    const att = attendances[member.id];
    let line = `${num}. ${member.name}`;

    if (att) {
      if (att.status === 'no') {
        const reason = att.reason ? ` ${att.reason}` : '';
        line += ` ❌${reason}`;
      } else if (att.status === 'yes') {
        line += ` ✅`;
      } else if (att.status === 'maybe') {
        const reason = att.reason ? ` (${att.reason})` : '';
        line += ` ⚠️ Em dúvida${reason}`;
      }
    }

    text += `${line}\n`;
  });

  text += `\n⸻\n\n`;
  text += `INSANOS M.C. – SOMOS DE VERDADE`;

  return text;
}

// ---------------- STATUS ROUTE ---------------- //
app.get('/api/status', async (req, res) => {
  try {
    const db = await getDb();
    const type = getActiveStorageType();
    const label = getStorageLabel();
    res.json({
      status: 'online',
      storageType: type,
      storageLabel: label,
      isCloudDatabase: type !== 'local',
      membersCount: db.members ? db.members.filter(m => m.active !== false).length : 0,
      eventsCount: db.events ? db.events.length : 0,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao verificar status do banco', details: err.message });
  }
});

// ---------------- AUTH ROUTES ---------------- //
// Member login with password ISSI (case-insensitive)
app.post('/api/auth/member', async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ success: false, message: 'Senha é obrigatória' });
  }

  const cleanInput = String(password).trim().toUpperCase();
  const db = await getDb();
  const validPassword = (db.config.memberPassword || 'ISSI').toUpperCase();

  if (cleanInput === validPassword) {
    return res.json({
      success: true,
      role: 'member',
      message: 'Acesso liberado, irmão!'
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Senha incorreta.'
  });
});

// Admin login
app.post('/api/auth/admin', async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ success: false, message: 'Senha é obrigatória' });
  }

  const db = await getDb();
  const adminPass = db.config.adminPasswordHash || 'diretoriamg';

  if (password === adminPass) {
    return res.json({
      success: true,
      role: 'admin',
      message: 'Acesso total de Diretoria liberado!'
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Senha de Administrador incorreta.'
  });
});

// Change admin password
app.post('/api/auth/change-admin-password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const db = await getDb();

  if (currentPassword !== db.config.adminPasswordHash) {
    return res.status(401).json({ success: false, message: 'Senha atual incorreta' });
  }

  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ success: false, message: 'A nova senha deve ter pelo menos 4 caracteres' });
  }

  db.config.adminPasswordHash = newPassword;
  await saveDb(db);

  return res.json({ success: true, message: 'Senha de Administrador alterada com sucesso!' });
});

// ---------------- CONFIG ROUTES ---------------- //
app.get('/api/config', async (req, res) => {
  const db = await getDb();
  res.json({
    clubName: db.config.clubName || "INSANOS M.C.",
    division: db.config.division || "DIVISÃO MOGI GUAÇU",
    motto: db.config.motto || "SOMOS DE VERDADE"
  });
});

app.put('/api/config', async (req, res) => {
  const { clubName, division, motto } = req.body;
  const db = await getDb();

  if (clubName) db.config.clubName = clubName.trim();
  if (division) db.config.division = division.trim();
  if (motto) db.config.motto = motto.trim();

  await saveDb(db);
  res.json({ success: true, config: db.config });
});

// ---------------- MEMBERS ROUTES ---------------- //
app.get('/api/members', async (req, res) => {
  const db = await getDb();
  const activeMembers = db.members.filter(m => m.active !== false);
  res.json(activeMembers);
});

// Add member (admin)
app.post('/api/members', async (req, res) => {
  const { name, nickname, role } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Nome do integrante é obrigatório' });
  }

  const db = await getDb();
  const newMember = {
    id: db.nextMemberId++,
    name: name.trim(),
    nickname: nickname ? nickname.trim() : "",
    role: role ? role.trim() : "Integrante",
    active: true,
    createdAt: new Date().toISOString()
  };

  db.members.push(newMember);
  await saveDb(db);
  res.status(201).json(newMember);
});

// Update member (admin)
app.put('/api/members/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, nickname, role, active } = req.body;
  const db = await getDb();

  const member = db.members.find(m => m.id === id);
  if (!member) {
    return res.status(404).json({ error: 'Integrante não encontrado' });
  }

  if (name !== undefined) member.name = name.trim();
  if (nickname !== undefined) member.nickname = nickname.trim();
  if (role !== undefined) member.role = role.trim();
  if (active !== undefined) member.active = Boolean(active);

  await saveDb(db);
  res.json(member);
});

// Delete member (admin)
app.delete('/api/members/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const db = await getDb();

  const index = db.members.findIndex(m => m.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Integrante não encontrado' });
  }

  const removed = db.members.splice(index, 1)[0];
  await saveDb(db);
  res.json({ success: true, removed });
});

// Reorder members (admin)
app.post('/api/members/reorder', async (req, res) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) {
    return res.status(400).json({ error: 'orderedIds deve ser uma lista de IDs' });
  }

  const db = await getDb();
  const memberMap = new Map(db.members.map(m => [m.id, m]));
  const reordered = [];

  for (const id of orderedIds) {
    if (memberMap.has(id)) {
      reordered.push(memberMap.get(id));
      memberMap.delete(id);
    }
  }

  for (const remaining of memberMap.values()) {
    reordered.push(remaining);
  }

  db.members = reordered;
  await saveDb(db);
  res.json(db.members.filter(m => m.active !== false));
});

// ---------------- EVENTS ROUTES ---------------- //
// List all events with summary counters
app.get('/api/events', async (req, res) => {
  const db = await getDb();
  const activeMembers = db.members.filter(m => m.active !== false);
  const totalMembers = activeMembers.length;

  const eventsSummary = db.events.map(ev => {
    const attendances = ev.attendances || {};
    let yesCount = 0;
    let noCount = 0;
    let maybeCount = 0;

    activeMembers.forEach(m => {
      const att = attendances[m.id];
      if (att) {
        if (att.status === 'yes') yesCount++;
        else if (att.status === 'no') noCount++;
        else if (att.status === 'maybe') maybeCount++;
      }
    });

    const answeredCount = yesCount + noCount + maybeCount;
    const pendingCount = Math.max(0, totalMembers - answeredCount);

    return {
      id: ev.id,
      title: ev.title,
      divisionHeader: ev.divisionHeader,
      date: ev.date,
      dateFormatted: ev.dateFormatted,
      time: ev.time,
      location: ev.location,
      category: ev.category,
      description: ev.description,
      status: ev.status || 'active',
      createdAt: ev.createdAt,
      stats: {
        totalMembers,
        yesCount,
        noCount,
        maybeCount,
        pendingCount
      }
    };
  });

  eventsSummary.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  res.json(eventsSummary);
});

// Get single event with full attendance roster
app.get('/api/events/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const db = await getDb();

  const event = db.events.find(e => e.id === id);
  if (!event) {
    return res.status(404).json({ error: 'Evento não encontrado' });
  }

  const activeMembers = db.members.filter(m => m.active !== false);
  const attendances = event.attendances || {};

  const roster = activeMembers.map((member, index) => {
    const att = attendances[member.id] || null;
    return {
      orderNumber: index + 1,
      memberId: member.id,
      name: member.name,
      nickname: member.nickname,
      role: member.role,
      status: att ? att.status : 'pending',
      reason: att ? att.reason || '' : '',
      updatedAt: att ? att.updatedAt : null
    };
  });

  const whatsappText = generateWhatsAppText(event, db.members);

  res.json({
    event,
    roster,
    whatsappText
  });
});

// Create event (admin)
app.post('/api/events', async (req, res) => {
  const { title, divisionHeader, date, dateFormatted, time, location, category, description } = req.body;

  if (!title || !date) {
    return res.status(400).json({ error: 'Título e data do evento são obrigatórios' });
  }

  const db = await getDb();
  const defaultHeader = `${db.config.clubName} – ${db.config.division}`;

  const newEvent = {
    id: db.nextEventId++,
    title: title.trim(),
    divisionHeader: divisionHeader ? divisionHeader.trim() : defaultHeader,
    date: date.trim(),
    dateFormatted: dateFormatted ? dateFormatted.trim() : date.trim(),
    time: time ? time.trim() : "",
    location: location ? location.trim() : "",
    category: category ? category.trim() : "Evento Oficial",
    description: description ? description.trim() : "",
    status: 'active',
    createdAt: new Date().toISOString(),
    attendances: {}
  };

  db.events.push(newEvent);
  await saveDb(db);
  res.status(201).json(newEvent);
});

// Update event (admin)
app.put('/api/events/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const db = await getDb();

  const event = db.events.find(e => e.id === id);
  if (!event) {
    return res.status(404).json({ error: 'Evento não encontrado' });
  }

  const { title, divisionHeader, date, dateFormatted, time, location, category, description, status } = req.body;

  if (title !== undefined) event.title = title.trim();
  if (divisionHeader !== undefined) event.divisionHeader = divisionHeader.trim();
  if (date !== undefined) event.date = date.trim();
  if (dateFormatted !== undefined) event.dateFormatted = dateFormatted.trim();
  if (time !== undefined) event.time = time.trim();
  if (location !== undefined) event.location = location.trim();
  if (category !== undefined) event.category = category.trim();
  if (description !== undefined) event.description = description.trim();
  if (status !== undefined) event.status = status;

  await saveDb(db);
  res.json(event);
});

// Delete event (admin)
app.delete('/api/events/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const db = await getDb();

  const index = db.events.findIndex(e => e.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Evento não encontrado' });
  }

  const removed = db.events.splice(index, 1)[0];
  await saveDb(db);
  res.json({ success: true, removed });
});

// Member or Admin confirms attendance
app.post('/api/events/:id/attend', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { memberId, status, reason } = req.body;

  if (!memberId || !status) {
    return res.status(400).json({ error: 'memberId e status são obrigatórios' });
  }

  const validStatuses = ['yes', 'no', 'maybe', 'clear'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Status inválido. Use yes, no, maybe ou clear.' });
  }

  const db = await getDb();
  const event = db.events.find(e => e.id === id);
  if (!event) {
    return res.status(404).json({ error: 'Evento não encontrado' });
  }

  const member = db.members.find(m => m.id === parseInt(memberId, 10));
  if (!member) {
    return res.status(404).json({ error: 'Integrante não encontrado' });
  }

  if (!event.attendances) {
    event.attendances = {};
  }

  if (status === 'clear') {
    delete event.attendances[member.id];
  } else {
    event.attendances[member.id] = {
      status,
      reason: reason ? reason.trim() : "",
      updatedAt: new Date().toISOString()
    };
  }

  await saveDb(db);

  const whatsappText = generateWhatsAppText(event, db.members);
  res.json({
    success: true,
    attendance: event.attendances[member.id] || null,
    whatsappText
  });
});

// Get formatted WhatsApp message for event
app.get('/api/events/:id/whatsapp', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const db = await getDb();

  const event = db.events.find(e => e.id === id);
  if (!event) {
    return res.status(404).json({ error: 'Evento não encontrado' });
  }

  const text = generateWhatsAppText(event, db.members);
  res.json({ whatsappText: text });
});

// Serve static frontend in production if built
const distPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(distPath));

// For SPA fallback routing in Express 5
app.use((req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send(`Backend API do INSANOS M.C. rodando na porta ${PORT}. Execute o client em modo dev ou faça o build.`);
    }
  });
});

// Start listener only when running standalone (not in Vercel serverless)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🏍️ Servidor INSANOS M.C. rodando em http://localhost:${PORT}`);
    console.log(`💾 Modo de armazenamento ativo: ${getStorageLabel()}`);
  });
}

module.exports = app;
