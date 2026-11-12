const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

const INITIAL_MEMBERS = [
  "Osiel",
  "Luna",
  "Campos",
  "Jimmy",
  "Nil",
  "Ribeiro",
  "Jão",
  "Perina",
  "Radical",
  "Marcel",
  "Morais",
  "Fião",
  "Vitorino",
  "Marlboro",
  "Pedro",
  "Duzão",
  "E. Ribeiro",
  "Campardo",
  "Fabião"
].map((name, index) => ({
  id: index + 1,
  name,
  nickname: "",
  active: true,
  createdAt: new Date().toISOString()
}));

const DEFAULT_DATA = {
  config: {
    clubName: "INSANOS M.C.",
    division: "DIVISÃO MOGI GUAÇU",
    motto: "SOMOS DE VERDADE",
    memberPassword: "ISSI",
    adminPasswordHash: "diretoriamg"
  },
  members: INITIAL_MEMBERS,
  nextMemberId: 20,
  events: [
    {
      id: 1,
      divisionHeader: "INSANOS M.C. – DIVISÃO MOGI GUAÇU",
      title: "1º Insanos Fest – Extrema/MG",
      date: "2026-11-14",
      dateFormatted: "Sábado – 14 de novembro de 2026",
      time: "A partir das 14:00",
      location: "Vila Mineira Open Mall e Gastronomia - Extrema/MG",
      category: "Evento Oficial",
      description: "Encontro de Motoclubes + Festival de Rock\n\nProgramação com bandas, gastronomia e espaço para as famílias.",
      status: "active",
      createdAt: new Date().toISOString(),
      attendances: {
        2: { status: "no", reason: "Social + Sede", updatedAt: new Date().toISOString() },
        5: { status: "no", reason: "Trabalho", updatedAt: new Date().toISOString() },
        13: { status: "maybe", reason: "", updatedAt: new Date().toISOString() },
        14: { status: "no", reason: "social + sede", updatedAt: new Date().toISOString() },
        16: { status: "no", reason: "Social+Sede", updatedAt: new Date().toISOString() },
        17: { status: "no", reason: "Social + Sede", updatedAt: new Date().toISOString() },
        19: { status: "no", reason: "social + trabalho", updatedAt: new Date().toISOString() }
      }
    }
  ],
  nextEventId: 2
};

function getSeedData() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch {
      // fallback
    }
  }
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

function getActiveStorageType() {
  if (process.env.MONGODB_URI) return 'mongodb';
  if (process.env.DATABASE_URL) return 'postgres';
  if (
    (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) ||
    (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ) return 'kv';
  return 'local';
}

function getStorageLabel() {
  const type = getActiveStorageType();
  switch (type) {
    case 'mongodb': return 'MongoDB Atlas (Nuvem)';
    case 'postgres': return 'PostgreSQL / Supabase / Neon (Nuvem)';
    case 'kv': return 'Vercel KV / Upstash Redis (Nuvem)';
    default: return 'Arquivo Local (JSON)';
  }
}

// ---------------- LOCAL FILE ADAPTER ---------------- //
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function localGet() {
  ensureDataDir();
  if (!fs.existsSync(DB_FILE)) {
    localSave(DEFAULT_DATA);
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[DB Local] Erro ao ler store.json:', err);
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
}

function localSave(data) {
  try {
    ensureDataDir();
    const tmpFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
  } catch (err) {
    // In serverless / read-only filesystem (like Vercel), local file write may fail
    console.warn('[DB Local] Não foi possível escrever no sistema de arquivos local:', err.message);
  }
}

// ---------------- MONGODB ATLAS ADAPTER ---------------- //
let mongoClient = null;
let mongoDb = null;

async function getMongoCollection() {
  if (!mongoDb) {
    const { MongoClient } = require('mongodb');
    mongoClient = new MongoClient(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    });
    await mongoClient.connect();
    const dbName = process.env.MONGODB_DB_NAME || 'insanos_mc';
    mongoDb = mongoClient.db(dbName);
    console.log(`[DB] Conectado com sucesso ao MongoDB Atlas (Database: ${dbName})`);
  }
  return mongoDb.collection('app_state');
}

async function mongoGet() {
  const col = await getMongoCollection();
  const doc = await col.findOne({ _id: 'main' });
  if (!doc) {
    const seed = getSeedData();
    await col.insertOne({ _id: 'main', ...seed });
    console.log('[DB] Banco MongoDB inicializado com dados oficiais do Insanos M.C.!');
    return seed;
  }
  const { _id, ...cleanData } = doc;
  return cleanData;
}

async function mongoSave(data) {
  const col = await getMongoCollection();
  await col.replaceOne(
    { _id: 'main' },
    { _id: 'main', ...data, updatedAt: new Date().toISOString() },
    { upsert: true }
  );
}

// ---------------- POSTGRES (SUPABASE / NEON) ADAPTER ---------------- //
let pgPool = null;
let pgInitialized = false;

function getPgPool() {
  if (!pgPool) {
    const { Pool } = require('pg');
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });
    console.log('[DB] Conectado ao PostgreSQL / Supabase / Neon');
  }
  return pgPool;
}

async function pgInit() {
  const pool = getPgPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS insanos_app_state (
      id VARCHAR(50) PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function pgGet() {
  const pool = getPgPool();
  if (!pgInitialized) {
    await pgInit();
    pgInitialized = true;
  }
  const res = await pool.query(`SELECT data FROM insanos_app_state WHERE id = 'main'`);
  if (res.rows.length === 0) {
    const seed = getSeedData();
    await pool.query(
      `INSERT INTO insanos_app_state (id, data) VALUES ('main', $1)`,
      [JSON.stringify(seed)]
    );
    console.log('[DB] Banco PostgreSQL inicializado com dados oficiais do Insanos M.C.!');
    return seed;
  }
  return res.rows[0].data;
}

async function pgSave(data) {
  const pool = getPgPool();
  if (!pgInitialized) {
    await pgInit();
    pgInitialized = true;
  }
  await pool.query(
    `INSERT INTO insanos_app_state (id, data, updated_at) 
     VALUES ('main', $1, NOW())
     ON CONFLICT (id) 
     DO UPDATE SET data = $1, updated_at = NOW()`,
    [JSON.stringify(data)]
  );
}

// ---------------- VERCEL KV / UPSTASH REDIS ADAPTER ---------------- //
function getKvConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return { url, token };
}

async function kvGet() {
  const { url, token } = getKvConfig();
  const res = await fetch(`${url}/get/insanos_mc_state`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const json = await res.json();
  if (!json.result) {
    const seed = getSeedData();
    await kvSave(seed);
    return seed;
  }
  return typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
}

async function kvSave(data) {
  const { url, token } = getKvConfig();
  await fetch(`${url}/set/insanos_mc_state`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([JSON.stringify(data)])
  });
}

// ---------------- UNIFIED PUBLIC API ---------------- //
async function getDb() {
  const type = getActiveStorageType();
  try {
    if (type === 'mongodb') return await mongoGet();
    if (type === 'postgres') return await pgGet();
    if (type === 'kv') return await kvGet();
  } catch (err) {
    console.error(`[DB Error - ${type}] Falha ao ler do banco em nuvem:`, err.message);
    console.warn('[DB Fallback] Utilizando arquivo local temporariamente.');
  }
  return localGet();
}

async function saveDb(data) {
  const type = getActiveStorageType();
  try {
    if (type === 'mongodb') {
      await mongoSave(data);
      return;
    }
    if (type === 'postgres') {
      await pgSave(data);
      return;
    }
    if (type === 'kv') {
      await kvSave(data);
      return;
    }
  } catch (err) {
    console.error(`[DB Error - ${type}] Falha ao salvar no banco em nuvem:`, err.message);
  }
  localSave(data);
}

module.exports = {
  getDb,
  saveDb,
  getActiveStorageType,
  getStorageLabel
};
