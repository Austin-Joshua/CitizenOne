import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Mic, MicOff, X, Volume2 } from 'lucide-react';
import { cn } from '../ui';
import { useI18n } from '../../context/I18nContext';

function getRecognitionCtor() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

const ROUTE_HINTS = [
  { keys: ['benefit', 'scheme', 'schemes', 'programme', 'program', 'लाभ', 'योजना', 'திட்டம்', 'పథకం'], path: '/app/benefits' },
  { keys: ['service', 'desk', 'request', 'सेवा', 'சேவை', 'సేవ'], path: '/app/services' },
  { keys: ['dashboard', 'home', 'command', 'डैश', 'முகப்பு', 'డాష్'], path: '/app/dashboard' },
  { keys: ['profile', 'account', 'प्रोफ़ाइल', 'சுயவிவரம்', 'ప్రొఫైల్'], path: '/app/profile' },
  { keys: ['setting', 'सेटिंग', 'அமைப்பு', 'సెట్టింగ్'], path: '/app/settings' },
  { keys: ['inclusion', 'accessibility', 'समावेशन', 'அணுகல்'], path: '/app/inclusion' },
  { keys: ['offline', 'connectivity', 'slow', 'नेट', 'இணைப்பு'], path: '/app/offline' },
  { keys: ['help', 'support', 'मदद', 'உதவி', 'సహాయం'], path: '/app/support' },
  { keys: ['vault', 'document', 'आवेदन', 'ஆவணம்', 'దస్తావేజు'], path: '/app/vault' },
  { keys: ['sms', 'text', 'message'], path: '/app/sms' },
];

function matchRoute(text) {
  const lower = text.toLowerCase();
  for (const { keys, path } of ROUTE_HINTS) {
    if (keys.some((k) => lower.includes(k.toLowerCase()))) return path;
  }
  return null;
}

export default function VoiceAssistantPanel() {
  const { t, speechLang } = useI18n();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const recRef = useRef(null);

  const stopListening = useCallback(() => {
    try {
      recRef.current?.stop?.();
    } catch {
      /* ignore */
    }
    recRef.current = null;
    setListening(false);
  }, []);

  useEffect(() => {
    return () => stopListening();
  }, [stopListening]);

  const speak = useCallback(
    (text) => {
      if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = speechLang;
      window.speechSynthesis.speak(u);
    },
    [speechLang]
  );

  const startListening = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setError(t('voice.notSupported'));
      return;
    }
    setError('');
    setTranscript('');
    setFeedback('');
    const rec = new Ctor();
    rec.lang = speechLang;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (ev) => {
      const text = ev.results?.[0]?.[0]?.transcript?.trim() || '';
      setTranscript(text);
      const path = matchRoute(text);
      if (path) {
        setFeedback(t('voice.navigated', { page: path.replace('/app/', '') }));
        navigate(path);
        speak(t('voice.navigated', { page: path.replace('/app/', '') }));
      } else {
        setError(t('voice.unclear'));
      }
      stopListening();
    };
    rec.onerror = (ev) => {
      if (ev.error === 'not-allowed') setError(t('voice.micDenied'));
      else setError(t('voice.unclear'));
      stopListening();
    };
    rec.onend = () => {
      setListening(false);
      recRef.current = null;
    };
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setError(t('voice.unclear'));
      setListening(false);
    }
  }, [navigate, speak, speechLang, stopListening, t]);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.99 }}
            transition={{ duration: 0.18 }}
            className="w-[min(100vw-2rem,22rem)] rounded-2xl border border-border-light bg-base p-4 shadow-elevated-lg"
            role="dialog"
            aria-label={t('voice.title')}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-primary">{t('voice.title')}</p>
                <p className="mt-1 text-xs leading-relaxed text-secondary">{t('voice.subtitle')}</p>
              </div>
              <button
                type="button"
                className="rounded-lg p-1 text-secondary hover:bg-base hover:text-primary"
                aria-label={t('voice.stop')}
                onClick={() => {
                  stopListening();
                  setOpen(false);
                }}
              >
                <X size={18} aria-hidden />
              </button>
            </div>
            <p className="mt-3 text-[11px] text-tertiary">{t('voice.hint')}</p>
            {error ? <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">{error}</p> : null}
            {transcript ? (
              <p className="mt-2 text-sm text-primary">
                <span className="text-tertiary">{t('voice.heard')} </span>
                {transcript}
              </p>
            ) : null}
            {feedback ? <p className="mt-1 text-xs text-semantic-success">{feedback}</p> : null}
            <p className="mt-3 text-[10px] leading-snug text-tertiary">{t('voice.privacyNote')}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors',
                  listening ? 'bg-red-600 hover:bg-red-700' : 'bg-accent-primary hover:bg-accent-primary/90'
                )}
                onClick={() => (listening ? stopListening() : startListening())}
              >
                {listening ? <MicOff size={18} aria-hidden /> : <Mic size={18} aria-hidden />}
                {listening ? t('voice.stop') : t('voice.start')}
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-border-light px-3 py-2 text-sm font-medium text-primary hover:bg-base"
                onClick={() => speak(transcript || t('voice.hint'))}
              >
                <Volume2 size={18} aria-hidden />
                {t('voice.speakResponse')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-full border-2 border-border-light bg-accent-primary text-white shadow-elevated-md shadow-accent-primary/20 transition-transform duration-150 hover:scale-[1.03] hover:bg-accent-hover focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-soft/40',
          listening && 'ring-4 ring-accent-primary/40 animate-pulse'
        )}
        aria-expanded={open}
        aria-label={t('voice.openAssistant')}
        onClick={() => {
          setOpen((o) => !o);
          setError('');
        }}
      >
        <Mic size={24} strokeWidth={2} aria-hidden />
      </button>
    </div>
  );
}
