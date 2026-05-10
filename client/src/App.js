import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RobotBackground } from './components/RobotBackground';
import { Onboarding } from './components/Onboarding';
import './App.css';

const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/$/, '');

function buildWelcomeText(profile) {
  const name = profile?.name ? `, ${profile.name.split(' ')[0]}` : '';
  return `Hello${name}! I'm your AI Career Counselor. Ask me anything about roles, skills, interviews, or your next career move.`;
}

// Read profile saved during onboarding (may be null on first load)
function loadSavedProfile() {
  try {
    const raw = localStorage.getItem('ob_profile');
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}

function IconMenu({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
function IconPlus({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function IconSun({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}
function IconMoon({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}
function IconVolume({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
    </svg>
  );
}
function IconVolumeOff({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M11 5L6 9H2v6h4l5 4V5z" />
      <path d="M23 9l-6 6M17 9l6 6" />
    </svg>
  );
}
function IconMic({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3zM19 10v1a7 7 0 01-14 0v-1M12 19v3" />
    </svg>
  );
}
function IconMicOff({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3zM19 10v1a7 7 0 01-14 0v-1M12 19v3M1 1l22 22" />
    </svg>
  );
}
function IconSend({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}
function IconTrash({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
    </svg>
  );
}
function IconPlaySpeak({ className }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M11 5L6 9H2v6h4l5 4V5z" />
      <path strokeLinecap="round" d="M15.5 8.5a5 5 0 010 7M18.5 6a8 8 0 010 12" />
    </svg>
  );
}

function IconStopSquare({ className }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

function stopSpeech() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

/** Prefer a clear English male voice for the AI counselor. */
function pickPreferredEnglishVoice() {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const en = voices.filter((v) => v.lang && /^en/i.test(v.lang));
  if (!en.length) return voices[0];
  const score = (v) => {
    const n = `${v.name} ${v.voiceURI || ''}`.toLowerCase();
    let s = 0;
    // Strong preference for known male English voices
    if (/\bmale\b|david|daniel|mark|fred|james|thomas|brian|george|john|arthur|richard|guy|liam|aaron|ryan|bruce|microsoft david|google uk english male/i.test(n)) {
      s += 5;
    }
    // Penalise clearly female voices
    if (/\bfemale\b|zira|samantha|victoria|karen|emma|fiona|serena|jenny|amy|aria|lisa|tessa|moira|susan|hazel/i.test(n)) {
      s -= 4;
    }
    return s;
  };
  return [...en].sort((a, b) => score(b) - score(a))[0];
}

function speakText(text, { muted, onEnd, voice }) {
  if (muted || !text?.trim() || !('speechSynthesis' in window)) {
    onEnd?.();
    return;
  }
  stopSpeech();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = 1;
  if (voice) u.voice = voice;
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.();
  window.speechSynthesis.speak(u);
}

function App() {
  // Load persisted profile once at startup
  const savedProfileRef = React.useRef(loadSavedProfile());

  const [messages, setMessages] = useState(() => [
    {
      id: 'welcome',
      from: 'bot',
      text: buildWelcomeText(savedProfileRef.current),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [micError, setMicError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [voiceMuted, setVoiceMuted] = useState(() => localStorage.getItem('voiceMuted') === '1');
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  /* Onboarding gate — persisted across reloads */
  const [onboarded, setOnboarded] = useState(
    () => localStorage.getItem('ob_done') === '1'
  );

  const recognitionRef = useRef(null);
  const chatScrollRef = useRef(null);
  const liveTranscriptRef = useRef('');
  const currentSessionIdRef = useRef(null);
  const preferredVoiceRef = useRef(null);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);

  const themeClass = isDarkMode ? 'theme-dark' : 'theme-light';

  function handleOnboardingComplete(profile) {
    try { localStorage.setItem('ob_profile', JSON.stringify(profile)); } catch (_) {}
    localStorage.setItem('ob_done', '1');
    savedProfileRef.current = profile;
    // Update the welcome message to include the real name now that we have it
    setMessages([
      {
        id: 'welcome',
        from: 'bot',
        text: buildWelcomeText(profile),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setOnboarded(true);
  }

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') setIsDarkMode(saved === 'dark');
    if (window.innerWidth < 900) setSidebarOpen(false);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.dataset.theme = isDarkMode ? 'dark' : 'light';
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('voiceMuted', voiceMuted ? '1' : '0');
  }, [voiceMuted]);

  useEffect(() => {
    currentSessionIdRef.current = currentSessionId;
  }, [currentSessionId]);

  // When the sidebar opens/closes it animates via a 220 ms CSS width transition.
  // Three.js (Spline renderer) never receives a resize event during that animation,
  // so its camera frustum stays calibrated for the old canvas width and the robot
  // appears off-centre. Firing window.resize after the transition completes forces
  // the renderer to recalculate its projection matrix and re-centre.
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300); // 300 ms > sidebar transition (220 ms)
    return () => clearTimeout(timer);
  }, [sidebarOpen]);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return undefined;
    const sync = () => {
      preferredVoiceRef.current = pickPreferredEnglishVoice();
    };
    sync();
    window.speechSynthesis.addEventListener('voiceschanged', sync);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', sync);
  }, []);

  useEffect(() => {
    const el = chatScrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  const loadChatSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/chat/sessions`);
      if (!response.ok) throw new Error('Failed to load sessions');
      const sessions = await response.json();
      setChatSessions(Array.isArray(sessions) ? sessions : []);
    } catch (e) {
      console.error(e);
      setChatSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChatSessions();
  }, [loadChatSessions]);

  useEffect(
    () => () => {
      try {
        recognitionRef.current?.stop?.();
      } catch (_) {}
      recognitionRef.current = null;
    },
    []
  );

  const firstUserSnippet = useCallback((msgs) => {
    const u = msgs.find((m) => m.from === 'user');
    if (!u?.text) return 'New chat';
    const t = u.text.trim();
    return t.length > 56 ? `${t.slice(0, 56)}…` : t;
  }, []);

  const persistTailRef = useRef(Promise.resolve());

  const persistSession = useCallback(
    async (msgs) => {
      const conv = msgs.filter((m) => m.id !== 'welcome');
      if (conv.length < 2) return;

      const payload = {
        title: firstUserSnippet(msgs),
        messages: conv.map((msg) => ({
          role: msg.from,
          content: msg.text,
          timestamp: msg.time,
        })),
      };

      const work = async () => {
        const sid = currentSessionIdRef.current;
        if (sid) {
          const r = await fetch(`${API_BASE}/chat/sessions/${sid}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: payload.title, messages: payload.messages }),
          });
          if (!r.ok) throw new Error('PUT failed');
        } else {
          const r = await fetch(`${API_BASE}/chat/sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: payload.title, messages: payload.messages }),
          });
          if (!r.ok) throw new Error('POST failed');
          const created = await r.json();
          if (created?.id) {
            currentSessionIdRef.current = created.id;
            setCurrentSessionId(created.id);
          }
        }
        await loadChatSessions();
      };

      persistTailRef.current = persistTailRef.current.then(work).catch((e) => {
        console.error('Save session failed', e);
      });
      await persistTailRef.current;
    },
    [firstUserSnippet, loadChatSessions]
  );

  const stopDictation = useCallback(() => {
    try {
      recognitionRef.current?.stop?.();
    } catch (_) {}
    recognitionRef.current = null;
    setListening(false);
  }, []);

  const startDictation = useCallback(() => {
    setMicError('');
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setMicError('Dictation needs the Web Speech API. Use Google Chrome or Microsoft Edge for best results.');
      return;
    }

    stopDictation();

    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setMicError('');
      setListening(true);
      liveTranscriptRef.current = '';
      setLiveTranscript('');
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
      const live = liveTranscriptRef.current.trim();
      if (live) {
        setInput((prev) => `${prev ? `${prev.trim()} ` : ''}${live}`.trim());
      }
      liveTranscriptRef.current = '';
      setLiveTranscript('');
    };

    recognition.onerror = (ev) => {
      const code = ev.error;
      if (code === 'not-allowed' || code === 'service-not-allowed') {
        setMicError('Microphone or speech permission blocked — check site permissions in your browser.');
      } else if (code === 'no-speech') {
        setMicError('No speech detected. Try again, or speak a little louder.');
      } else if (code === 'network') {
        setMicError(
          'Speech-to-text could not reach Google’s service. Try Google Chrome, disable Brave Shields for localhost, or allow network access for speech.'
        );
      } else if (code === 'aborted') {
        setMicError('');
      } else {
        setMicError(code ? `Dictation: ${code}` : 'Dictation error');
      }
      setListening(false);
      recognitionRef.current = null;
    };

    recognition.onresult = (event) => {
      let text = '';
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      liveTranscriptRef.current = text;
      setLiveTranscript(text);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (err) {
      recognitionRef.current = null;
      setListening(false);
      if (String(err).includes('already')) {
        setMicError('Mic was busy — try again.');
      } else {
        setMicError('Could not start dictation. Try again or reload the page.');
      }
    }
  }, [stopDictation]);

  const toggleMic = () => {
    if (listening) {
      stopDictation();
    } else {
      startDictation();
    }
  };

  const loadSession = async (sessionId) => {
    stopSpeech();
    stopDictation();
    try {
      const response = await fetch(`${API_BASE}/chat/sessions/${sessionId}`);
      if (!response.ok) throw new Error('Not found');
      const session = await response.json();
      const loaded =
        session.messages?.length > 0
          ? session.messages.map((msg, i) => ({
              id: `${sessionId}-${i}`,
              from: msg.role,
              text: msg.content,
              time: msg.timestamp,
            }))
          : [
              {
                id: 'welcome',
                from: 'bot',
                text: buildWelcomeText(savedProfileRef.current),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ];
      setMessages(loaded);
      currentSessionIdRef.current = sessionId;
      setCurrentSessionId(sessionId);
      if (window.innerWidth < 900) setSidebarOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const startNewChat = () => {
    stopSpeech();
    stopDictation();
    persistTailRef.current = Promise.resolve();
    currentSessionIdRef.current = null;
    setCurrentSessionId(null);
    setMessages([
      {
        id: 'welcome',
        from: 'bot',
        text: buildWelcomeText(savedProfileRef.current),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setInput('');
    setLiveTranscript('');
    if (window.innerWidth < 900) setSidebarOpen(false);
  };

  const deleteSession = async (sessionId, e) => {
    e?.stopPropagation();
    try {
      await fetch(`${API_BASE}/chat/sessions/${sessionId}`, { method: 'DELETE' });
      await loadChatSessions();
      if (currentSessionId === sessionId) {
        startNewChat();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const onListenClick = (msg) => {
    if (voiceMuted) return;
    if (msg.from !== 'bot' || !msg.text?.trim()) return;
    if (speakingMessageId === msg.id) {
      stopSpeech();
      setSpeakingMessageId(null);
      return;
    }
    setSpeakingMessageId(msg.id);
    speakText(msg.text, {
      muted: voiceMuted,
      voice: preferredVoiceRef.current,
      onEnd: () => setSpeakingMessageId(null),
    });
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    stopSpeech();
    stopDictation();
    const userMessage = {
      id: `u-${Date.now()}`,
      from: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev.filter((m) => m.id !== 'welcome'), userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          // Send profile so the server can personalise the system prompt
          profile: savedProfileRef.current
            ? {
                name:          savedProfileRef.current.name,
                qualification: savedProfileRef.current.customQualification || savedProfileRef.current.qualification,
                stream:        savedProfileRef.current.customStream        || savedProfileRef.current.stream,
                experience:    savedProfileRef.current.customExperience    || savedProfileRef.current.experience,
              }
            : null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      const reply = typeof data.response === 'string' ? data.response : 'Something went wrong. Try again.';

      const botMessage = {
        id: `b-${Date.now()}`,
        from: 'bot',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => {
        if (prev.some((m) => m.id === botMessage.id)) return prev;
        const next = [...prev, botMessage];
        queueMicrotask(() => {
          void persistSession(next);
        });
        return next;
      });
      setLoading(false);
    } catch {
      setLoading(false);
      const errMsg = {
        id: `b-${Date.now()}-e`,
        from: 'bot',
        text: 'Could not reach the server. Check that the API is running and CORS is allowed.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => {
        if (prev.some((m) => m.id === errMsg.id)) return prev;
        const next = [...prev, errMsg];
        queueMicrotask(() => {
          void persistSession(next);
        });
        return next;
      });
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* Render onboarding gate */
  if (!onboarded) {
    return (
      <div className={`app-root ${themeClass}`}>
        <Onboarding
          onComplete={handleOnboardingComplete}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode((d) => !d)}
        />
      </div>
    );
  }

  return (
    <div className={`app-root ${themeClass}`}>
      <aside className={`sidebar ${sidebarOpen ? 'is-open' : ''}`} aria-label="Chat history">
        <div className="sidebar-brand">
          <div className="sidebar-logo">Career</div>
          <button type="button" className="sidebar-close-mobile" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            ×
          </button>
        </div>
        <button type="button" className="sidebar-new-chat" onClick={startNewChat}>
          <IconPlus className="icon" />
          New chat
        </button>
        <div className="sidebar-section-label">Recent</div>
        <div className="sidebar-sessions">
          {sessionsLoading && <div className="sidebar-muted">Loading…</div>}
          {!sessionsLoading && chatSessions.length === 0 && <div className="sidebar-muted">No saved chats yet</div>}
          {chatSessions.map((s) => (
            <div
              key={s.id}
              className={`session-row ${currentSessionId === s.id ? 'is-active' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => loadSession(s.id)}
              onKeyDown={(e) => e.key === 'Enter' && loadSession(s.id)}
            >
              <div className="session-row-body">
                <span className="session-row-title">{s.title || 'Untitled'}</span>
                <span className="session-row-meta">{new Date(s.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </div>
              <button type="button" className="session-row-delete" title="Delete" onClick={(e) => deleteSession(s.id, e)} aria-label="Delete chat">
                <IconTrash />
              </button>
            </div>
          ))}
        </div>
      </aside>

      <div
        className={`sidebar-backdrop ${sidebarOpen ? 'is-visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
        onKeyDown={(e) => e.key === 'Escape' && setSidebarOpen(false)}
        role="presentation"
        aria-hidden={!sidebarOpen}
      />

      <div className="main-column">
        <div className="main-column-stack">
        <header className="top-bar">
          <div className="top-bar-left">
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => setSidebarOpen((o) => !o)}
              title={sidebarOpen ? 'Hide chat history' : 'Show chat history'}
              aria-label="Toggle chat history"
              aria-expanded={sidebarOpen}
            >
              <IconMenu />
            </button>
            <div className="top-bar-title-block">
              <h1 className="top-bar-title">AI Career Counselor</h1>
              <p className="top-bar-sub">Llama 3 · Ollama</p>
            </div>
          </div>
          <div className="top-bar-actions">
            <button type="button" className="toolbar-btn" onClick={startNewChat} title="New chat" aria-label="New chat">
              <IconPlus />
            </button>
            <button
              type="button"
              className={`toolbar-btn ${voiceMuted ? 'is-muted' : ''}`}
              onClick={() => {
                setVoiceMuted((m) => {
                  const next = !m;
                  if (next) {
                    stopSpeech();
                    setSpeakingMessageId(null);
                  }
                  return next;
                });
              }}
              title={voiceMuted ? 'Voice off — unmute to use Listen on messages' : 'Voice on — mute to disable Listen'}
              aria-pressed={voiceMuted}
              aria-label={voiceMuted ? 'Unmute voice' : 'Mute voice'}
            >
              {voiceMuted ? <IconVolumeOff /> : <IconVolume />}
            </button>
            <button type="button" className="toolbar-btn" onClick={() => setIsDarkMode((d) => !d)} title="Theme" aria-label="Toggle theme">
              {isDarkMode ? <IconSun /> : <IconMoon />}
            </button>
          </div>
        </header>

        <div className="chat-scroll-robot-layer" aria-hidden="true">
            <RobotBackground />
          </div>
          <div className="chat-scroll-robot-fade" aria-hidden="true" />

        <main ref={chatScrollRef} className="chat-scroll">
          <div className="chat-inner">
            {messages.map((msg) => (
              <div key={msg.id} className={`msg-row ${msg.from}`}>
                <div className="msg-avatar" aria-hidden>
                  {msg.from === 'bot' ? '✦' : 'You'}
                </div>
                <div className="msg-block">
                  <div className={`msg-bubble ${msg.from}`}>
                    <div className="msg-text">{msg.text}</div>
                    <div className="msg-footer">
                      <time className="msg-time">{msg.time}</time>
                      {msg.from === 'bot' && msg.text?.trim() && (
                        <button
                          type="button"
                          className={`msg-speak ${voiceMuted ? 'is-disabled' : ''} ${speakingMessageId === msg.id ? 'is-speaking' : ''}`}
                          disabled={voiceMuted}
                          title={
                            voiceMuted
                              ? 'Unmute voice in the header to listen'
                              : speakingMessageId === msg.id
                                ? 'Stop reading'
                                : 'Read this message aloud'
                          }
                          aria-pressed={speakingMessageId === msg.id}
                          onClick={() => onListenClick(msg)}
                        >
                          {speakingMessageId === msg.id ? <IconStopSquare /> : <IconPlaySpeak />}
                          <span>{speakingMessageId === msg.id ? 'Stop' : 'Listen'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="msg-row bot">
                <div className="msg-avatar" aria-hidden>
                  ✦
                </div>
                <div className="msg-block">
                  <div className="msg-bubble bot is-typing">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        <footer className="composer">
          {micError && <div className="composer-hint composer-hint-error">{micError}</div>}
          {listening && (
            <div className="composer-hint">
              <span className="pulse" /> Listening… {liveTranscript && <em className="composer-live">{liveTranscript}</em>}
            </div>
          )}
          <div className="composer-box">
            <button
              type="button"
              className={`composer-mic ${listening ? 'is-active' : ''}`}
              onClick={toggleMic}
              aria-pressed={listening}
              title={listening ? 'Stop dictation' : 'Dictate'}
              aria-label={listening ? 'Stop dictation' : 'Start dictation'}
            >
              {listening ? <IconMicOff /> : <IconMic />}
            </button>
            <textarea
              className="composer-input"
              rows={1}
              placeholder="Message your career counselor…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={loading}
            />
            <button type="button" className="composer-send" disabled={loading || !input.trim()} onClick={sendMessage} title="Send" aria-label="Send">
              <IconSend />
            </button>
          </div>
        </footer>
        </div>
      </div>
    </div>
  );
}

export default App;
