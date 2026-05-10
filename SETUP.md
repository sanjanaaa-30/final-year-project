# AI Career Counselor - Setup Guide

Welcome! This guide helps you set up and run the **AI Career Counselor** project locally from scratch, even if you are a beginner.

---

## 1) Project Overview

### What this project does
AI Career Counselor is a full-stack web application that helps users explore career paths using AI-powered conversation and guidance.

### Key features
- 🤖 AI career guidance chatbot
- 🧭 Personalized onboarding experience
- 🗺️ Career roadmap suggestions
- 🎙️ Voice support (where enabled in the app)
- 💾 MongoDB-based data storage
- 🎨 Theme switching for better user experience

### Technology stack
- **Frontend:** React.js + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** MongoDB
- **AI runtime:** Ollama with `llama3`
- **Architecture:** MERN-style project structure (`client` + `server`)

---

## 2) Prerequisites

Install the following software before running the project:

### 1. Node.js (LTS recommended: 18.x or 20.x)
- **Why needed:** Runs JavaScript for frontend and backend, and provides `npm`.
- **Check version:**
  ```bash
  node -v
  npm -v
  ```

### 2. MongoDB Community Server
- **Why needed:** Stores application data (users, chat history, preferences, etc.).
- **Check if available:**
  ```bash
  mongod --version
  ```

### 3. MongoDB Compass
- **Why needed:** GUI tool to view and manage MongoDB database visually.

### 4. Ollama
- **Why needed:** Runs the local `llama3` model for AI responses.
- **Check version:**
  ```bash
  ollama --version
  ```

### 5. Git (Optional but recommended)
- **Why needed:** Clone and update the project easily.

### 6. VS Code or Cursor
- **Why needed:** Code editing, terminal access, project management.

> 💡 **Tip:** Install all tools first, then restart your computer once to avoid PATH-related command issues.

---

## 3) Software Installation (Step-by-Step)

Use the official links below:

### Node.js
- Download: [https://nodejs.org/en/download](https://nodejs.org/en/download)
- Install the **LTS** version.
- During setup, keep default options.
- Verify:
  ```bash
  node -v
  npm -v
  ```

### MongoDB Community Server
- Download: [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
- Install with default options.
- On Windows, keep **MongoDB as a Service** enabled.
- Verify:
  ```bash
  mongod --version
  ```

### MongoDB Compass
- Download: [https://www.mongodb.com/try/download/compass](https://www.mongodb.com/try/download/compass)
- Install and launch after MongoDB installation.

### Ollama
- Download: [https://ollama.com/download](https://ollama.com/download)
- Install and finish setup.
- Verify:
  ```bash
  ollama --version
  ```

---

## 4) Ollama Setup

After installing Ollama, run these commands:

```bash
ollama pull llama3
ollama run llama3
```

### What these commands do
- `ollama pull llama3`
  - Downloads the `llama3` model to your local machine.
- `ollama run llama3`
  - Starts a chat session with the model and confirms it runs correctly.

> ✅ If `ollama run llama3` opens a prompt, Ollama is working properly.

---

## 5) Project Setup

### Open terminal
Use:
- Terminal in VS Code/Cursor, or
- Windows PowerShell / Command Prompt

### Navigate to project folder

```bash
cd /d "d:\MERN Project\Project-AI Based Career Counselor"
```

### Get project code (if needed)

If cloning with Git:

```bash
git clone <your-repository-url>
cd "Project-AI Based Career Counselor"
```

If downloaded as ZIP:
1. Extract ZIP.
2. Open extracted folder in VS Code/Cursor.
3. Open terminal in that folder.

---

## 6) Dependency Installation

Run these commands in the project root:

```bash
npm install
npm run install:all
```

### What each command means
- `npm install`
  - Installs **root dependencies** from root `package.json` (for example, tooling like `concurrently` used to run frontend and backend together).
- `npm run install:all`
  - Installs dependencies inside both:
    - `server` (backend packages)
    - `client` (frontend packages)

### Root vs Client/Server dependencies
- **Root dependencies:** Project-level utilities/scripts.
- **Server dependencies:** Express, MongoDB driver/ODM, backend runtime packages.
- **Client dependencies:** React, UI libraries, frontend runtime packages.

---

## 7) Environment Variables Setup

You must create two `.env` files.

---

### A) Create `server/.env`

Create file: `server/.env`

```env
MONGODB_URI=mongodb://127.0.0.1:27017/career_counselor
PORT=5000
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3
```

#### Variable explanation
- `MONGODB_URI`
  - MongoDB connection string for local database named `career_counselor`.
- `PORT`
  - Backend server port (Express API runs on `5000`).
- `OLLAMA_URL`
  - Local Ollama service URL.
- `OLLAMA_MODEL`
  - Model name your backend should call (`llama3`).

---

### B) Create `client/.env`

Create file: `client/.env`

```env
REACT_APP_API_URL=http://localhost:5000
```

#### Variable explanation
- `REACT_APP_API_URL`
  - Frontend API base URL to call backend endpoints.

> ⚠️ **Important:** In React, client environment variables must start with `REACT_APP_`.

---

## 8) MongoDB Setup

### Open MongoDB Compass
1. Launch MongoDB Compass.
2. In connection string field, paste:
   ```text
   mongodb://127.0.0.1:27017
   ```
3. Click **Connect**.

### Database creation behavior
- The `career_counselor` database is typically auto-created when the app first writes data.
- You may not see it immediately until first successful API/database operation.

### Why `career_counselor`?
- Your `MONGODB_URI` explicitly points to this DB name:
  - `mongodb://127.0.0.1:27017/career_counselor`

---

## 9) Running the Project

You have two methods.

### Method 1: Run frontend + backend together (recommended)

```bash
npm run dev
```

This runs both:
- backend (`server`)
- frontend (`client`)

---

### Method 2: Run separately (2 terminals)

#### Backend
```bash
npm run server
```

#### Frontend
```bash
npm run client
```

---

## 10) Opening the App

Once running:

- Frontend URL:  
  ```text
  http://localhost:3000
  ```

- Backend URL:  
  ```text
  http://localhost:5000
  ```

> ✅ Open frontend URL in browser to use the application.

---

## 11) Recommended Terminal Setup

For smooth development, use at least 2 terminals:

### Terminal 1 (Ollama)
- Keep Ollama model/service active
- Example:
  ```bash
  ollama run llama3
  ```

### Terminal 2 (MERN app)
- Run your app:
  ```bash
  npm run dev
  ```

> 💡 **Tip:** If you run frontend/backend separately, use 3 terminals (Ollama + server + client).

---

## 12) Common Errors & Fixes

### 1. `npm` is not recognized
**Cause:** Node.js not installed correctly or PATH not set.  
**Fix:**
- Reinstall Node.js (LTS) from official website.
- Restart terminal/PC.
- Verify:
  ```bash
  node -v
  npm -v
  ```

### 2. MongoDB connection failed
**Cause:** MongoDB service not running or wrong URI.  
**Fix:**
- Start MongoDB service.
- Confirm `server/.env` has:
  ```env
  MONGODB_URI=mongodb://127.0.0.1:27017/career_counselor
  ```
- Test in Compass using `mongodb://127.0.0.1:27017`.

### 3. `ollama` command not found
**Cause:** Ollama not installed or terminal not restarted.  
**Fix:**
- Reinstall from [https://ollama.com/download](https://ollama.com/download)
- Restart terminal
- Verify:
  ```bash
  ollama --version
  ```

### 4. Port already in use (`3000` or `5000`)
**Cause:** Another app is using same port.  
**Fix options:**
- Close conflicting process, or
- Change port in `.env` and corresponding client URL.

### 5. Failed API requests
**Cause:** Backend not running or wrong `REACT_APP_API_URL`.  
**Fix:**
- Ensure backend runs on `http://localhost:5000`.
- Ensure `client/.env` contains:
  ```env
  REACT_APP_API_URL=http://localhost:5000
  ```
- Restart frontend after editing `.env`.

### 6. Module not found
**Cause:** Missing dependencies.  
**Fix:**
```bash
npm install
npm run install:all
```

### 7. CORS issues
**Cause:** Frontend and backend origin mismatch or backend CORS config issue.  
**Fix:**
- Ensure frontend URL is `http://localhost:3000`.
- Ensure backend URL is `http://localhost:5000`.
- Verify server CORS settings allow frontend origin.

---

## 13) Folder Structure

Important folders in this project:

- `client`
  - React frontend app (UI, pages, components).
- `server`
  - Express backend API and database logic.
- `server/src/models`
  - Mongoose schemas/models for MongoDB collections.
- `server/src/routes`
  - API route definitions.
- `server/src/controllers`
  - Request handlers and business logic.
- `client/src/components`
  - Reusable frontend UI components.

---

## 14) Features

This project includes:

- 🤖 AI Career Guidance
- 🎨 Theme Switching
- 🎙️ Voice Support
- 🗺️ Career Roadmap Suggestions
- 💾 MongoDB Data Storage
- 💬 AI Chatbot Experience
- 🧑 Personalized User Onboarding

---

## 15) Final Notes

- Keep **Ollama running** while using AI features.
- Ensure **MongoDB service is active** before starting backend.
- Both `server/.env` and `client/.env` are required.
- If you change any `.env` value, restart the app.

---

## Quick Start Checklist ✅

1. Install Node.js, MongoDB, MongoDB Compass, Ollama.
2. Pull model:
   ```bash
   ollama pull llama3
   ```
3. In project root:
   ```bash
   npm install
   npm run install:all
   ```
4. Create `server/.env` and `client/.env`.
5. Start app:
   ```bash
   npm run dev
   ```
6. Open:
   - `http://localhost:3000`

---

Happy building! 🚀
