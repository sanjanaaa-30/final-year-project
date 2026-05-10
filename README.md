# AI Career Counselor (MERN)

Full-stack chat app: **MongoDB**, **Express**, **React** (CRA), **Node**. The API mirrors the previous FastAPI + SQLite backend (`Backend/main.py`): Ollama chat (non-streaming and streaming), chat session CRUD, and database introspection endpoints.

## Prerequisites

1. **MongoDB** — local or remote (Atlas). Example local URI: `mongodb://127.0.0.1:27017/career_counselor`
2. **Node.js** (LTS recommended)
3. **Ollama** — [ollama.com](https://ollama.com)

Pull the default model (matches server default):

```bash
ollama pull llama3
```

## Project layout

| Path       | Role                                      |
|-----------|--------------------------------------------|
| `server/` | Express + Mongoose API                     |
| `client/` | React UI (streaming chat, sessions, theme, speech) |

Legacy folders `Backend/` (FastAPI) and `frontend/` remain for reference; **run `server/` + `client/`** for the MERN stack.

## Configuration

**Server** — copy `server/.env.example` to `server/.env`:

- `MONGODB_URI` — MongoDB connection string
- `PORT` — API port (default `5000`)
- `OLLAMA_URL` — Ollama base URL (default `http://localhost:11434`)
- `OLLAMA_MODEL` — model name (default `llama3`)

**Client** — copy `client/.env.example` to `client/.env`:

- `REACT_APP_API_URL` — Express base URL with **no** trailing slash (default `http://localhost:5000`)

## Install and run

From the repo root:

```bash
npm install
npm run install:all
```

Terminal 1 — API:

```bash
npm run server
```

Terminal 2 — React (development server on port 3000):

```bash
npm run client
```

Optional single command (runs both):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Ensure MongoDB is running and Ollama is serving the configured model.

## API overview

Aligned with the former FastAPI app:

| Method | Path | Description |
|--------|------|-------------|
| POST | `/chat` | Body `{ "message": "..." }` → `{ "response": "..." }` |
| POST | `/chat/stream` | Same body; **text/plain** stream of raw assistant token chunks |
| GET | `/chat/sessions` | List sessions (newest `updated_at` first) |
| POST | `/chat/sessions` | Create session (`title`, `messages[]`) |
| GET | `/chat/sessions/:id` | Get one session |
| PUT | `/chat/sessions/:id` | Update `title` and/or `messages` |
| DELETE | `/chat/sessions/:id` | Delete session |
| GET | `/database/info` | DB stats (MongoDB-shaped, same keys as before where applicable) |
| GET | `/database/export` | `{ sessions, export_date }` |
| GET | `/database/raw` | Columns + rows (messages column JSON-stringified like SQLite export) |

Messages use `{ "role": "user" \| "bot", "content", "timestamp" }` with ISO-ish timestamp strings as stored by the UI.

## Production build (client)

```bash
npm run build --prefix client
```

Serve the `client/build` static files behind your reverse proxy and point `REACT_APP_API_URL` at your deployed API when building.
