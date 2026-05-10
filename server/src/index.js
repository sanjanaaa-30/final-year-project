import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import { randomUUID } from 'crypto';
import { ChatSession } from './models/ChatSession.js';
import { UserProfile } from './models/UserProfile.js';

const BASE_SYSTEM_PROMPT =
  'You are an expert AI career counselor who gives clear, friendly, actionable, and highly personalised advice. ' +
  'Speak as a neutral professional assistant: do not invent a personal name, nickname, or gendered persona. ' +
  'Keep responses structured — use short paragraphs or bullet points where helpful. ' +
  'Stay practical and concise unless the user asks for more detail.';

/**
 * Build a personalised system prompt that injects the user’s profile
 * so Ollama can tailor every response accordingly.
 * @param {{ name?: string, qualification?: string, stream?: string, experience?: string } | null | undefined} profile
 */
function buildSystemPrompt(profile) {
  if (!profile || !profile.name) return BASE_SYSTEM_PROMPT;

  const { name, qualification, stream, experience } = profile;
  return (
    BASE_SYSTEM_PROMPT +
    `\n\nUser profile:\n` +
    `- Name: ${name}\n` +
    (qualification ? `- Highest qualification: ${qualification}\n` : '') +
    (stream       ? `- Field / stream: ${stream}\n`               : '') +
    (experience   ? `- Work experience: ${experience}\n`          : '') +
    `\nAlways address the user by their first name (${name.split(' ')[0]}) when appropriate. ` +
    `Tailor every recommendation, example, and career path suggestion specifically to their ` +
    `qualification level (${qualification || 'unspecified'}), field (${stream || 'unspecified'}), ` +
    `and experience level (${experience || 'unspecified'}). ` +
    `Do not give generic advice that ignores their background.`
  );
}

const PORT = Number(process.env.PORT) || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/career_counselor';
const OLLAMA_URL = (process.env.OLLAMA_URL || 'http://localhost:11434').replace(/\/$/, '');
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

const app = express();

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);
app.use(express.json());

function sessionDocToApi(doc) {
  return {
    id: doc.id,
    title: doc.title,
    messages: doc.messages.map((m) => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp,
    })),
    created_at: doc.created_at,
    updated_at: doc.updated_at,
  };
}

/**
 * @param {string} message
 * @param {object|null} profile
 */
async function ollamaChatNonStream(message, profile) {
  try {
    const r = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          { role: 'system', content: buildSystemPrompt(profile) },
          { role: 'user', content: message },
        ],
        stream: false,
      }),
    });
    const data = await r.json();
    if (data?.message?.content != null) {
      return { response: String(data.message.content).trim() };
    }
    return { response: 'Error: Unexpected response format.' };
  } catch (e) {
    return { response: `Error: ${String(e)}` };
  }
}

/* ─────────────────────────── Onboarding ─────────────────────────── */

/** POST /onboarding — save a new user profile */
app.post('/onboarding', async (req, res, next) => {
  try {
    const { name, qualification, customQualification, stream, customStream, experience, customExperience, themeUsed } = req.body || {};

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ detail: 'Name is required.' });
    }
    if (!qualification) return res.status(400).json({ detail: 'Qualification is required.' });
    if (!stream)         return res.status(400).json({ detail: 'Stream is required.' });
    if (!experience)     return res.status(400).json({ detail: 'Experience is required.' });

    if (qualification === 'Other' && !customQualification?.trim()) {
      return res.status(400).json({ detail: 'Please specify your qualification.' });
    }
    if (stream === 'Other' && !customStream?.trim()) {
      return res.status(400).json({ detail: 'Please specify your stream.' });
    }
    if (experience === 'Other' && !customExperience?.trim()) {
      return res.status(400).json({ detail: 'Please specify your experience.' });
    }

    const profile = await UserProfile.create({
      name: name.trim(),
      qualification,
      customQualification: customQualification?.trim() || '',
      stream,
      customStream: customStream?.trim() || '',
      experience,
      customExperience: customExperience?.trim() || '',
      themeUsed: themeUsed === 'light' ? 'light' : 'dark',
    });

    res.status(201).json({ success: true, profile });
  } catch (e) {
    next(e);
  }
});

/** GET /onboarding — list all profiles (admin / debug) */
app.get('/onboarding', async (_req, res, next) => {
  try {
    const profiles = await UserProfile.find().sort({ createdAt: -1 }).lean();
    res.json(profiles);
  } catch (e) {
    next(e);
  }
});

/* ─────────────────────────── Chat ─────────────────────────── */

app.post('/chat', async (req, res) => {
  const { message, profile } = req.body || {};
  if (typeof message !== 'string') {
    return res.status(400).json({ response: 'Error: message must be a string.' });
  }
  const out = await ollamaChatNonStream(message, profile || null);
  res.json(out);
});

app.post('/chat/stream', async (req, res) => {
  const { message } = req.body || {};
  if (typeof message !== 'string') {
    res.status(400).setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Error: message must be a string.');
    return;
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');

  try {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message },
        ],
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      res.end(`\n[Error] Ollama request failed: HTTP ${response.status}`);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    outer: while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const chunk = JSON.parse(line);
          if (chunk.done) break outer;
          const content = chunk.message?.content;
          if (content) res.write(content);
        } catch {
          continue;
        }
      }
    }

    if (buffer.trim()) {
      try {
        const chunk = JSON.parse(buffer);
        if (!chunk.done) {
          const content = chunk.message?.content;
          if (content) res.write(content);
        }
      } catch {
        // ignore trailing partial line (matches tolerant Python json.loads failures)
      }
    }

    res.end();
  } catch (exc) {
    res.write(`\n[Error] ${String(exc)}`);
    res.end();
  }
});

app.get('/chat/sessions', async (_req, res, next) => {
  try {
    const docs = await ChatSession.find().sort({ updated_at: -1 }).lean();
    res.json(docs.map(sessionDocToApi));
  } catch (e) {
    next(e);
  }
});

app.get('/chat/sessions/:id', async (req, res, next) => {
  try {
    const doc = await ChatSession.findOne({ id: req.params.id }).lean();
    if (!doc) {
      return res.status(404).json({ detail: 'Chat session not found' });
    }
    res.json(sessionDocToApi(doc));
  } catch (e) {
    next(e);
  }
});

app.post('/chat/sessions', async (req, res, next) => {
  try {
    const { title, messages } = req.body || {};
    if (typeof title !== 'string' || !Array.isArray(messages)) {
      return res.status(400).json({ detail: 'Invalid session payload' });
    }
    const now = new Date().toISOString();
    const id = randomUUID();
    const doc = await ChatSession.create({
      id,
      title,
      messages,
      created_at: now,
      updated_at: now,
    });
    res.json(sessionDocToApi(doc));
  } catch (e) {
    next(e);
  }
});

app.put('/chat/sessions/:id', async (req, res, next) => {
  try {
    const doc = await ChatSession.findOne({ id: req.params.id });
    if (!doc) {
      return res.status(404).json({ detail: 'Chat session not found' });
    }
    const { title, messages } = req.body || {};
    if (title !== undefined) doc.title = title;
    if (messages !== undefined) doc.messages = messages;
    doc.updated_at = new Date().toISOString();
    await doc.save();
    res.json(sessionDocToApi(doc));
  } catch (e) {
    next(e);
  }
});

app.delete('/chat/sessions/:id', async (req, res, next) => {
  try {
    const result = await ChatSession.deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ detail: 'Chat session not found' });
    }
    res.json({ message: 'Chat session deleted successfully' });
  } catch (e) {
    next(e);
  }
});

app.get('/database/info', async (_req, res, next) => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const sessionCount = await ChatSession.countDocuments();
    const sessions = await ChatSession.find().select('messages').lean();
    let totalMessages = 0;
    for (const s of sessions) {
      totalMessages += (s.messages || []).length;
    }
    let dbSize = 0;
    try {
      const dbStats = await db.command({ dbStats: 1 });
      dbSize = dbStats.storageSize || dbStats.dataSize || 0;
    } catch {
      // ignore stats errors on restricted deployments
    }
    res.json({
      database_file: `${mongoose.connection.name} (MongoDB)`,
      tables: collections.map((c) => c.name),
      session_count: sessionCount,
      total_messages: totalMessages,
      database_size_bytes: dbSize,
      database_size_mb: Math.round((dbSize / (1024 * 1024)) * 100) / 100,
    });
  } catch (e) {
    next(e);
  }
});

app.get('/database/export', async (_req, res, next) => {
  try {
    const docs = await ChatSession.find().sort({ created_at: -1 }).lean();
    const sessions = docs.map((d) => ({
      id: d.id,
      title: d.title,
      messages: d.messages,
      created_at: d.created_at,
      updated_at: d.updated_at,
    }));
    res.json({ sessions, export_date: new Date().toISOString() });
  } catch (e) {
    next(e);
  }
});

app.get('/database/raw', async (_req, res, next) => {
  try {
    const docs = await ChatSession.find().lean();
    const columns = ['id', 'title', 'messages', 'created_at', 'updated_at'];
    const rows = docs.map((d) => [
      d.id,
      d.title,
      JSON.stringify(d.messages ?? []),
      d.created_at,
      d.updated_at,
    ]);
    res.json({
      columns,
      rows,
      row_count: rows.length,
    });
  } catch (e) {
    next(e);
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ detail: String(err?.message || err) });
});

async function main() {
  await mongoose.connect(MONGODB_URI);
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
