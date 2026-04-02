import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Send,
  FileText,
  Mic,
  MicOff,
  Trash2,
  ChevronDown,
  BrainCircuit,
  User,
  AlertCircle,
} from 'lucide-react';
import { cn } from '../ui';
import { useAuth } from '../../context/AuthContext';
import { useAIChat } from '../../hooks/useAIChat';
import AIResponseCard from './AIResponseCard';
import { getUserDisplayName } from '../../lib/userDisplayName';

// ─── Typing indicator ───────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-1 py-2">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="h-1.5 w-1.5 rounded-full bg-accent-primary/60"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
      />
    ))}
    <span className="ml-2 text-[10px] font-medium text-secondary/60">Analyzing...</span>
  </div>
);

// ─── Quick suggestion chip ──────────────────────────────────────────────────
const SuggestionChip = ({ text, onClick }) => (
  <button
    onClick={() => onClick(text)}
    className="rounded-xl bg-surface/80 px-3 py-1.5 text-[11px] font-medium text-primary ring-1 ring-border-light/60 transition-all hover:bg-surface hover:ring-accent-primary/30 hover:text-accent-primary active:scale-[0.97] text-left leading-snug"
  >
    {text}
  </button>
);

// ─── Document paste modal ───────────────────────────────────────────────────
const DocumentModal = ({ open, onClose, onSubmit }) => {
  const [text, setText] = useState('');

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex flex-col bg-bg-primary/95 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-2 border-b border-border-light px-4 py-3">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-violet-400" />
          <span className="text-[13px] font-semibold text-primary">Paste Government Text</span>
        </div>
        <button onClick={onClose} className="rounded-lg p-1 text-secondary hover:bg-surface hover:text-primary">
          <X size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-hidden p-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the government circular, rule text, or scheme details here..."
          className="h-full w-full resize-none rounded-xl border border-border-light bg-surface p-3 text-[13px] text-primary placeholder:text-tertiary focus:border-accent-primary/40 focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
          autoFocus
        />
      </div>
      <div className="flex gap-2 border-t border-border-light px-4 py-3">
        <button
          onClick={onClose}
          className="flex-1 rounded-xl border border-border-light px-4 py-2 text-[12px] font-semibold text-secondary hover:bg-surface"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            if (text.trim().length >= 10) {
              onSubmit(text.trim());
              setText('');
              onClose();
            }
          }}
          disabled={text.trim().length < 10}
          className="flex-1 rounded-xl bg-accent-primary px-4 py-2 text-[12px] font-semibold text-white shadow-sm shadow-accent-primary/25 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-primary/90"
        >
          Simplify Text
        </button>
      </div>
    </motion.div>
  );
};

// ─── Main BureaucracyAI component ───────────────────────────────────────────
const BureaucracyAI = ({ pageMode = false }) => {
  const [isOpen, setIsOpen] = useState(pageMode ? true : false);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported] = useState(() => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  const { user } = useAuth();
  const displayName = getUserDisplayName(user, 'there');
  const firstName = displayName.split(' ')[0];

  const {
    messages,
    loading,
    error,
    suggestions,
    personalization,
    sendMessage,
    simplifyDocument,
    fetchSuggestions,
    clearChat,
  } = useAIChat();

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Fetch suggestions when panel opens
  useEffect(() => {
    if (isOpen && suggestions.length === 0) {
      fetchSuggestions();
    }
  }, [isOpen, suggestions.length, fetchSuggestions]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = useCallback(() => {
    const text = inputValue.trim();
    if (!text) return;
    setInputValue('');
    sendMessage(text);
  }, [inputValue, sendMessage]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleSuggestionClick = useCallback((text) => {
    sendMessage(text);
  }, [sendMessage]);

  // ─── Voice input ────────────────────────────────────────────────────────
  const toggleVoice = useCallback(() => {
    if (!speechSupported) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInputValue(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [speechSupported, isListening]);

  // Determine if we should show the welcome screen
  const showWelcome = messages.length === 0;

  return (
    <>
      {/* ── Floating trigger button ─────────────────────────────────── */}
      <AnimatePresence>
        {!pageMode && !isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-2xl shadow-xl shadow-accent-primary/30 transition-shadow hover:shadow-2xl hover:shadow-accent-primary/40"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent-primary) 0%, #7c3aed 100%)',
            }}
            aria-label="Open Bureaucracy Simplifier AI"
          >
            <BrainCircuit size={24} className="text-white" strokeWidth={2} />
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-2xl animate-ping bg-accent-primary/30 pointer-events-none" style={{ animationDuration: '2s' }} />
            {/* Notification dot if there are unread suggestions */}
            {messages.length === 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[8px] font-bold text-amber-950 ring-2 ring-bg-primary">
                AI
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat panel ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "flex flex-col overflow-hidden rounded-2xl border border-border-light/60 shadow-2xl shadow-black/20",
              pageMode ? "relative w-full h-full max-h-none" : "fixed bottom-4 right-4 z-[65] sm:bottom-6 sm:right-6"
            )}
            style={pageMode ? { background: 'var(--color-bg-primary)' } : {
              width: 'min(420px, calc(100vw - 32px))',
              height: 'min(680px, calc(100vh - 100px))',
              background: 'var(--color-bg-primary)',
            }}
          >
            {/* ─── Header ─────────────────────────────────────────── */}
            <div
              className="relative flex items-center gap-3 px-4 py-3 border-b border-border-light"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(124,58,237,0.06) 100%)',
              }}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-primary to-purple-600 shadow-sm shadow-accent-primary/25">
                <BrainCircuit size={18} className="text-white" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-[13px] font-bold text-primary leading-snug">Bureaucracy Simplifier</h3>
                <p className="text-[10px] font-medium text-secondary/70">AI-powered government assistant</p>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="rounded-lg p-1.5 text-secondary/60 transition-colors hover:bg-surface hover:text-secondary"
                    title="Clear chat"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
                {!pageMode && (
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg p-1.5 text-secondary/60 transition-colors hover:bg-surface hover:text-primary"
                    aria-label="Close AI panel"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* ─── Messages area ──────────────────────────────────── */}
            <div className="relative flex-1 overflow-y-auto px-4 py-4 scroll-smooth" style={{ scrollbarWidth: 'thin' }}>
              <AnimatePresence mode="popLayout">
                {showWelcome ? (
                  /* ── Welcome screen ─────────────────────────────── */
                  <motion.div
                    key="welcome"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-5"
                  >
                    {/* Greeting */}
                    <div className="text-center pt-4">
                      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-primary/20 to-violet-500/20 ring-1 ring-accent-primary/20">
                        <BrainCircuit size={28} className="text-accent-primary" />
                      </div>
                      <h4 className="text-[16px] font-bold text-primary">
                        Hi, {firstName}! 👋
                      </h4>
                      <p className="mt-1 text-[12px] text-secondary leading-relaxed max-w-[280px] mx-auto">
                        I simplify government schemes, rules & circulars. Ask me anything!
                      </p>
                      {personalization && !personalization.profileComplete && (
                        <p className="mt-2 text-[10px] text-amber-500 font-medium">
                          💡 Complete your profile for personalized scheme recommendations
                        </p>
                      )}
                    </div>

                    {/* Quick action grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => sendMessage('What schemes am I eligible for?')}
                        className="flex flex-col items-center gap-1.5 rounded-xl border border-border-light/60 bg-surface/30 p-3 text-center transition-all hover:border-accent-primary/30 hover:bg-accent-primary/5"
                      >
                        <span className="text-[16px]">🔍</span>
                        <span className="text-[10px] font-semibold text-primary leading-snug">Check Eligibility</span>
                      </button>
                      <button
                        onClick={() => sendMessage('What documents do I need for government schemes?')}
                        className="flex flex-col items-center gap-1.5 rounded-xl border border-border-light/60 bg-surface/30 p-3 text-center transition-all hover:border-accent-primary/30 hover:bg-accent-primary/5"
                      >
                        <span className="text-[16px]">📄</span>
                        <span className="text-[10px] font-semibold text-primary leading-snug">List Documents</span>
                      </button>
                      <button
                        onClick={() => setDocModalOpen(true)}
                        className="flex flex-col items-center gap-1.5 rounded-xl border border-border-light/60 bg-surface/30 p-3 text-center transition-all hover:border-violet-400/30 hover:bg-violet-500/5"
                      >
                        <span className="text-[16px]">📋</span>
                        <span className="text-[10px] font-semibold text-primary leading-snug">Simplify Text</span>
                      </button>
                      <button
                        onClick={() => sendMessage('How to apply for government schemes?')}
                        className="flex flex-col items-center gap-1.5 rounded-xl border border-border-light/60 bg-surface/30 p-3 text-center transition-all hover:border-emerald-400/30 hover:bg-emerald-500/5"
                      >
                        <span className="text-[16px]">✅</span>
                        <span className="text-[10px] font-semibold text-primary leading-snug">Apply Now</span>
                      </button>
                    </div>

                    {/* Suggested queries */}
                    {suggestions.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-secondary/60">
                          Suggested for you
                        </p>
                        <div className="flex flex-col gap-1.5">
                          {suggestions.slice(0, 4).map((s, i) => (
                            <SuggestionChip key={i} text={s} onClick={handleSuggestionClick} />
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  /* ── Message thread ─────────────────────────────── */
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={cn('flex gap-2.5', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                      >
                        {/* AI avatar */}
                        {msg.role === 'assistant' && (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent-primary/20 to-violet-500/20 mt-0.5">
                            <BrainCircuit size={13} className="text-accent-primary" />
                          </div>
                        )}

                        {/* Message bubble */}
                        <div
                          className={cn(
                            'max-w-[85%] rounded-2xl px-3.5 py-2.5',
                            msg.role === 'user'
                              ? 'bg-accent-primary text-white rounded-br-md'
                              : 'bg-surface/60 ring-1 ring-border-light/40 rounded-bl-md'
                          )}
                        >
                          {msg.typing ? (
                            <TypingIndicator />
                          ) : msg.role === 'user' ? (
                            <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          ) : (
                            <AIResponseCard
                              data={msg.data}
                              relatedSchemes={msg.relatedSchemes}
                              onSuggestionClick={handleSuggestionClick}
                            />
                          )}
                        </div>

                        {/* User avatar */}
                        {msg.role === 'user' && (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-primary/15 mt-0.5">
                            <User size={13} className="text-accent-primary" />
                          </div>
                        )}
                      </motion.div>
                    ))}

                    {/* Quick suggestions after last AI message */}
                    {!loading && messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && messages[messages.length - 1]?.suggestions?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pl-9">
                        {messages[messages.length - 1].suggestions.map((s, i) => (
                          <SuggestionChip key={i} text={s} onClick={handleSuggestionClick} />
                        ))}
                      </div>
                    )}

                    {/* Error message */}
                    {error && (
                      <div className="flex items-start gap-2 rounded-xl bg-red-500/8 p-3 ring-1 ring-red-400/15 ml-9">
                        <AlertCircle size={13} className="mt-0.5 shrink-0 text-red-500" />
                        <p className="text-[11px] text-red-500">{error}</p>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </AnimatePresence>

              {/* Document paste modal */}
              <AnimatePresence>
                <DocumentModal
                  open={docModalOpen}
                  onClose={() => setDocModalOpen(false)}
                  onSubmit={simplifyDocument}
                />
              </AnimatePresence>
            </div>

            {/* ─── Input area ─────────────────────────────────────── */}
            <div className="border-t border-border-light px-3 py-3">
              <div className="flex items-end gap-2">
                {/* Document paste button */}
                <button
                  onClick={() => setDocModalOpen(true)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-secondary/60 transition-colors hover:bg-surface hover:text-secondary"
                  title="Paste government text"
                >
                  <FileText size={16} />
                </button>

                {/* Text input */}
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about any scheme or rule..."
                    disabled={loading}
                    className="w-full rounded-xl border border-border-light bg-surface py-2 pl-3 pr-10 text-[13px] text-primary placeholder:text-tertiary transition-colors focus:border-accent-primary/40 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 disabled:opacity-50"
                  />
                  {/* Send button (inside input) */}
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || loading}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-lg bg-accent-primary text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent-primary/90"
                  >
                    <Send size={13} />
                  </button>
                </div>

                {/* Voice input button */}
                {speechSupported && (
                  <button
                    onClick={toggleVoice}
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all',
                      isListening
                        ? 'bg-red-500/15 text-red-500 ring-2 ring-red-500/30 animate-pulse'
                        : 'text-secondary/60 hover:bg-surface hover:text-secondary'
                    )}
                    title={isListening ? 'Stop listening' : 'Voice input'}
                  >
                    {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>
                )}
              </div>

              {/* Powered by indicator */}
              <p className="mt-2 text-center text-[9px] font-medium text-secondary/40">
                Powered by CitizenOne Intelligence · Data from verified government sources
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BureaucracyAI;
