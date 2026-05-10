import React, { useEffect, useRef, useState } from 'react';
import { RobotBackground } from './RobotBackground';
import './Onboarding.css';

const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/$/, '');

/* ─── Dropdown option sets ─── */
const QUALIFICATIONS = [
  'High School / 10th',
  'Intermediate / 12th',
  'Diploma',
  'Undergraduate (Pursuing)',
  'Graduate / Bachelor\'s Degree',
  'Post Graduate / Master\'s Degree',
  'PhD / Doctorate',
  'Certification Course',
  'Other',
];

const STREAMS = [
  'Computer Science / IT',
  'Engineering',
  'Commerce',
  'Science',
  'Arts / Humanities',
  'Management / Business',
  'Medical / Healthcare',
  'Law',
  'Education / Teaching',
  'Design / UI-UX',
  'Finance / Accounting',
  'Marketing',
  'Data Science / AI',
  'Cybersecurity',
  'Hospitality / Hotel Management',
  'Animation / Multimedia',
  'Agriculture',
  'Architecture',
  'Psychology',
  'Other',
];

const EXPERIENCES = [
  'Fresher',
  'Less than 1 year',
  '1-2 years',
  '2-5 years',
  '5-10 years',
  '10+ years',
  'Other',
];

/* ─── Inline SVG icons ─── */
function IconSun() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}
function IconMoon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}
function IconChevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
function IconArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

/* ─── Floating particles ─── */
function Particles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: `${Math.random() * 4 + 2}px`,
    duration: `${Math.random() * 10 + 8}s`,
    delay: `${Math.random() * 10}s`,
    opacity: Math.random() * 0.5 + 0.1,
  }));
  return (
    <div className="ob-particles" aria-hidden>
      {particles.map((p) => (
        <span
          key={p.id}
          className="ob-particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Toast ─── */
function Toast({ toasts }) {
  return (
    <div className="ob-toast-wrap" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`ob-toast ${t.type}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

/* ─── Main component ─── */
export function Onboarding({ onComplete, isDarkMode, onToggleTheme }) {
  const [form, setForm] = useState({
    name: '',
    qualification: '',
    customQualification: '',
    stream: '',
    customStream: '',
    experience: '',
    customExperience: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const toastTimers = useRef([]);

  /* Cleanup timers on unmount */
  useEffect(() => () => toastTimers.current.forEach(clearTimeout), []);

  function addToast(message, type = 'success') {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    const t = setTimeout(
      () => setToasts((prev) => prev.filter((x) => x.id !== id)),
      3500
    );
    toastTimers.current.push(t);
  }

  /* ── Field change ── */
  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  /* ── Validate ── */
  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required.';
    if (!form.qualification) e.qualification = 'Please select your qualification.';
    if (form.qualification === 'Other' && !form.customQualification.trim())
      e.customQualification = 'Please specify your qualification.';
    if (!form.stream) e.stream = 'Please select your stream.';
    if (form.stream === 'Other' && !form.customStream.trim())
      e.customStream = 'Please specify your stream.';
    if (!form.experience) e.experience = 'Please select your experience level.';
    if (form.experience === 'Other' && !form.customExperience.trim())
      e.customExperience = 'Please specify your experience.';
    return e;
  }

  const isValid = (() => {
    if (!form.name.trim()) return false;
    if (!form.qualification) return false;
    if (form.qualification === 'Other' && !form.customQualification.trim()) return false;
    if (!form.stream) return false;
    if (form.stream === 'Other' && !form.customStream.trim()) return false;
    if (!form.experience) return false;
    if (form.experience === 'Other' && !form.customExperience.trim()) return false;
    return true;
  })();

  /* ── Submit ── */
  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        themeUsed: isDarkMode ? 'dark' : 'light',
      };
      const res = await fetch(`${API_BASE}/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || 'Submission failed. Please try again.');
      }
      addToast('🎉 Welcome aboard! Redirecting to your counselor…', 'success');
      setTimeout(() => onComplete(data.profile || payload), 1600);
    } catch (err) {
      addToast(`⚠️ ${err.message}`, 'error');
      setLoading(false);
    }
  }

  /* ── Field helper ── */
  function field(id, label, children, errorKey) {
    return (
      <div className="ob-field" key={id}>
        <label className="ob-label" htmlFor={id}>{label}</label>
        {children}
        {errors[errorKey || id] && (
          <span className="ob-error" role="alert">{errors[errorKey || id]}</span>
        )}
      </div>
    );
  }

  return (
    <div className="ob-root">
      <Particles />

      {/* Theme toggle */}
      <button
        type="button"
        className="ob-theme-btn"
        onClick={onToggleTheme}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        title="Toggle theme"
      >
        {isDarkMode ? <IconSun /> : <IconMoon />}
      </button>

      {/* ── Left — Form ── */}
      <div className="ob-left">
        {/* Brand */}
        <div className="ob-brand">
          <div className="ob-brand-badge">
            <span className="ob-brand-dot" />
            AI Powered · Career Guidance
          </div>
          <h1 className="ob-brand-title">Your Career<br />Journey Starts Here</h1>
          <p className="ob-brand-sub">Tell me a little about yourself so I can give you the best advice.</p>
        </div>

        {/* Form */}
        <form className="ob-form" onSubmit={handleSubmit} noValidate>

          {/* Field 1 — Name */}
          {field('ob-name', 'Full Name',
            <input
              id="ob-name"
              type="text"
              className={`ob-input${errors.name ? ' has-error' : ''}`}
              placeholder="e.g. Aditya Sharma"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              autoComplete="name"
              required
            />
          )}

          {/* Field 2 — Qualification */}
          {field('ob-qualification', 'Highest Qualification',
            <>
              <div className="ob-select-wrap">
                <select
                  id="ob-qualification"
                  className={`ob-select${errors.qualification ? ' has-error' : ''}`}
                  value={form.qualification}
                  onChange={(e) => handleChange('qualification', e.target.value)}
                >
                  <option value="">— Select qualification —</option>
                  {QUALIFICATIONS.map((q) => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
                <span className="ob-select-chevron"><IconChevron /></span>
              </div>
              <div className={`ob-other-wrap${form.qualification === 'Other' ? ' is-open' : ''}`}>
                <input
                  id="ob-customQualification"
                  type="text"
                  className={`ob-input${errors.customQualification ? ' has-error' : ''}`}
                  placeholder="Please specify qualification"
                  value={form.customQualification}
                  onChange={(e) => handleChange('customQualification', e.target.value)}
                  tabIndex={form.qualification === 'Other' ? 0 : -1}
                />
                {errors.customQualification && (
                  <span className="ob-error" role="alert">{errors.customQualification}</span>
                )}
              </div>
            </>,
            'qualification'
          )}

          {/* Field 3 — Stream */}
          {field('ob-stream', 'Stream / Field of Study',
            <>
              <div className="ob-select-wrap">
                <select
                  id="ob-stream"
                  className={`ob-select${errors.stream ? ' has-error' : ''}`}
                  value={form.stream}
                  onChange={(e) => handleChange('stream', e.target.value)}
                >
                  <option value="">— Select stream —</option>
                  {STREAMS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <span className="ob-select-chevron"><IconChevron /></span>
              </div>
              <div className={`ob-other-wrap${form.stream === 'Other' ? ' is-open' : ''}`}>
                <input
                  id="ob-customStream"
                  type="text"
                  className={`ob-input${errors.customStream ? ' has-error' : ''}`}
                  placeholder="Please specify stream"
                  value={form.customStream}
                  onChange={(e) => handleChange('customStream', e.target.value)}
                  tabIndex={form.stream === 'Other' ? 0 : -1}
                />
                {errors.customStream && (
                  <span className="ob-error" role="alert">{errors.customStream}</span>
                )}
              </div>
            </>,
            'stream'
          )}

          {/* Field 4 — Experience */}
          {field('ob-experience', 'Work Experience',
            <>
              <div className="ob-select-wrap">
                <select
                  id="ob-experience"
                  className={`ob-select${errors.experience ? ' has-error' : ''}`}
                  value={form.experience}
                  onChange={(e) => handleChange('experience', e.target.value)}
                >
                  <option value="">— Select experience —</option>
                  {EXPERIENCES.map((x) => (
                    <option key={x} value={x}>{x}</option>
                  ))}
                </select>
                <span className="ob-select-chevron"><IconChevron /></span>
              </div>
              <div className={`ob-other-wrap${form.experience === 'Other' ? ' is-open' : ''}`}>
                <input
                  id="ob-customExperience"
                  type="text"
                  className={`ob-input${errors.customExperience ? ' has-error' : ''}`}
                  placeholder="Please specify experience"
                  value={form.customExperience}
                  onChange={(e) => handleChange('customExperience', e.target.value)}
                  tabIndex={form.experience === 'Other' ? 0 : -1}
                />
                {errors.customExperience && (
                  <span className="ob-error" role="alert">{errors.customExperience}</span>
                )}
              </div>
            </>,
            'experience'
          )}

          {/* Submit */}
          <div className="ob-submit-wrap">
            <button
              id="ob-submit-btn"
              type="submit"
              className="ob-submit"
              disabled={!isValid || loading}
            >
              {loading ? (
                <>
                  <span className="ob-submit-spinner" />
                  Saving your profile…
                </>
              ) : (
                <>
                  Start Career Counseling
                  <IconArrow />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Right — Robot + Greeting ── */}
      <div className="ob-right">
        <div className="ob-robot-wrap">
          <RobotBackground />
        </div>

        <div className="ob-greeting" role="complementary" aria-label="AI Greeting">
          <p className="ob-greeting-title">Hello! I'm your AI Career Counselor 👋</p>
          <p className="ob-greeting-sub">
            Let me understand your background so I can guide you better.
            Fill in your details and let's build your career path together!
          </p>
        </div>
      </div>

      <Toast toasts={toasts} />
    </div>
  );
}
