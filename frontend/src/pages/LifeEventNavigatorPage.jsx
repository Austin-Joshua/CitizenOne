import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronDown,
  Check,
  FileText,
  ListChecks,
  ArrowLeft,
  Search,
  Sparkles,
  AlertCircle,
  Compass,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Card, cn } from '../components/ui';
import { apiFetch } from '../lib/api';

// ─── Constants ──────────────────────────────────────────────────────────────

const STORAGE_KEY = 'citizen-life-events-progress';

const PRIORITY_META = {
  high: {
    label: 'High',
    dotClass: 'bg-red-500',
    pillClass: 'bg-red-500/10 text-red-500 ring-1 ring-red-500/20',
  },
  medium: {
    label: 'Medium',
    dotClass: 'bg-amber-500',
    pillClass: 'bg-amber-400/10 text-amber-600 ring-1 ring-amber-400/20',
  },
  low: {
    label: 'Low',
    dotClass: 'bg-blue-400',
    pillClass: 'bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20',
  },
};

const CATEGORY_COLORS = {
  Legal: 'bg-violet-500/10 text-violet-500 ring-violet-500/20',
  Identity: 'bg-blue-500/10 text-blue-500 ring-blue-500/20',
  Finance: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20',
  Tax: 'bg-amber-500/10 text-amber-600 ring-amber-500/20',
  Health: 'bg-rose-500/10 text-rose-600 ring-rose-500/20',
  Utilities: 'bg-teal-500/10 text-teal-600 ring-teal-500/20',
  Education: 'bg-indigo-500/10 text-indigo-600 ring-indigo-500/20',
  Government: 'bg-slate-500/10 text-slate-600 ring-slate-500/20',
};

// ─── Persistence ────────────────────────────────────────────────────────────

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore
  }
}

// ─── Animation variants ─────────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
};

// ─── Event Card in the selection grid ───────────────────────────────────────

const EVENT_CARD_COLORS = [
  'from-violet-500/15 to-indigo-500/10 hover:from-violet-500/25 hover:to-indigo-500/15 border-violet-500/20 hover:border-violet-500/40',
  'from-rose-500/15 to-pink-500/10 hover:from-rose-500/25 hover:to-pink-500/15 border-rose-500/20 hover:border-rose-500/40',
  'from-blue-500/15 to-cyan-500/10 hover:from-blue-500/25 hover:to-cyan-500/15 border-blue-500/20 hover:border-blue-500/40',
  'from-amber-500/15 to-orange-500/10 hover:from-amber-500/25 hover:to-orange-500/15 border-amber-500/20 hover:border-amber-500/40',
  'from-emerald-500/15 to-teal-500/10 hover:from-emerald-500/25 hover:to-teal-500/15 border-emerald-500/20 hover:border-emerald-500/40',
  'from-slate-500/15 to-gray-500/10 hover:from-slate-500/25 hover:to-gray-500/15 border-slate-500/20 hover:border-slate-500/40',
  'from-indigo-500/15 to-purple-500/10 hover:from-indigo-500/25 hover:to-purple-500/15 border-indigo-500/20 hover:border-indigo-500/40',
];

const EventCard = ({ event, index, onClick }) => {
  const colorClass = EVENT_CARD_COLORS[index % EVENT_CARD_COLORS.length];
  return (
    <motion.button
      variants={fadeUp}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(event.id)}
      className={cn(
        'group relative flex flex-col items-center gap-3 rounded-2xl border bg-gradient-to-br p-6 text-center transition-all duration-200',
        colorClass
      )}
    >
      <span className="text-4xl">{event.emoji}</span>
      <div>
        <h3 className="text-[14px] font-semibold text-primary leading-snug">
          {event.label}
        </h3>
        <p className="mt-1 text-[11px] text-secondary leading-relaxed">
          {event.description}
        </p>
      </div>
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-accent-primary opacity-0 transition-opacity group-hover:opacity-100">
        Get Checklist <ArrowRight size={10} />
      </span>
    </motion.button>
  );
};

// ─── Checklist Task Item ────────────────────────────────────────────────────

const TaskItem = ({ task, isChecked, onToggle }) => {
  const [expanded, setExpanded] = useState(false);
  const priority = PRIORITY_META[task.priority] || PRIORITY_META.medium;
  const categoryColor = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.Government;

  return (
    <motion.div
      layout
      variants={fadeUp}
      className={cn(
        'rounded-2xl border transition-all duration-200',
        isChecked
          ? 'border-emerald-500/20 bg-emerald-500/[0.03]'
          : 'border-border-light bg-surface/30 hover:border-border-light/80'
      )}
    >
      {/* Task header */}
      <div className="flex items-start gap-3 p-4">
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task.id);
          }}
          className={cn(
            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200',
            isChecked
              ? 'border-emerald-500 bg-emerald-500 text-white scale-100'
              : 'border-border-light hover:border-accent-primary/50'
          )}
          aria-label={isChecked ? `Mark "${task.title}" as incomplete` : `Mark "${task.title}" as complete`}
        >
          {isChecked && <Check size={12} strokeWidth={3} />}
        </button>

        {/* Content */}
        <div
          className="min-w-0 flex-1 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-start justify-between gap-2">
            <h4
              className={cn(
                'text-[13px] font-semibold leading-snug transition-colors',
                isChecked ? 'text-secondary line-through' : 'text-primary'
              )}
            >
              {task.title}
            </h4>
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="mt-0.5 shrink-0"
            >
              <ChevronDown size={14} className="text-secondary" />
            </motion.div>
          </div>
          <p
            className={cn(
              'mt-0.5 text-[11px] leading-relaxed',
              isChecked ? 'text-tertiary' : 'text-secondary'
            )}
          >
            {task.description}
          </p>
          {/* Badges */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ring-1', categoryColor)}>
              {task.category}
            </span>
            <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider', priority.pillClass)}>
              <span className={cn('h-1.5 w-1.5 rounded-full', priority.dotClass)} />
              {priority.label} Priority
            </span>
          </div>
        </div>
      </div>

      {/* Expandable details */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-border-light/50 px-4 pb-4 pt-3">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Steps */}
                <div>
                  <div className="mb-2 flex items-center gap-1.5">
                    <ListChecks size={12} className="text-accent-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent-primary">
                      Steps to Complete
                    </span>
                  </div>
                  <ol className="space-y-1.5 pl-0">
                    {task.steps.map((step, i) => (
                      <li key={i} className="flex gap-2 text-[12px] leading-relaxed text-secondary">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-primary/10 text-[9px] font-bold text-accent-primary">
                          {i + 1}
                        </span>
                        <span className="pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Documents */}
                <div>
                  <div className="mb-2 flex items-center gap-1.5">
                    <FileText size={12} className="text-violet-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-violet-500">
                      Required Documents
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {task.documents.map((doc, i) => (
                      <li key={i} className="flex items-start gap-2 text-[12px] leading-relaxed text-secondary">
                        <ChevronRight size={10} className="mt-1 shrink-0 text-violet-400" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Progress Bar ───────────────────────────────────────────────────────────

const ProgressBar = ({ completed, total }) => {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = completed === total && total > 0;

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-surface ring-1 ring-border-light/50">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            'absolute inset-y-0 left-0 rounded-full',
            isComplete
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
              : 'bg-gradient-to-r from-accent-primary to-violet-500'
          )}
        />
      </div>
      <span className={cn(
        'text-[12px] font-bold tabular-nums',
        isComplete ? 'text-emerald-500' : 'text-primary'
      )}>
        {pct}%
      </span>
    </div>
  );
};

// ─── Main Page Component ────────────────────────────────────────────────────

const LifeEventNavigatorPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');

  // Checklist state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [checklistLoading, setChecklistLoading] = useState(false);
  const [checklistError, setChecklistError] = useState(null);
  const [progress, setProgress] = useState(() => loadProgress());

  // Persist progress
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  // Fetch available events on mount
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await apiFetch('/api/life-events');
        if (res.ok) {
          const data = await res.json();
          setEvents(data.events || []);
        }
      } catch {
        // Events will show from the fallback
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Fetch checklist for an event
  const fetchChecklist = useCallback(async (eventInput) => {
    setChecklistLoading(true);
    setChecklistError(null);
    try {
      const res = await apiFetch('/api/life-events/checklist', {
        method: 'POST',
        body: JSON.stringify({ event: eventInput }),
      });
      const data = await res.json();
      if (data.matched) {
        setSelectedEvent(data.event);
        setChecklist(data.checklist);
      } else {
        setChecklistError(data.message || 'Could not match your input to a life event.');
      }
    } catch {
      setChecklistError('Failed to generate checklist. Please try again.');
    } finally {
      setChecklistLoading(false);
    }
  }, []);

  const handleEventSelect = useCallback((eventId) => {
    setSearchInput('');
    fetchChecklist(eventId);
  }, [fetchChecklist]);

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    if (searchInput.trim().length >= 2) {
      fetchChecklist(searchInput.trim());
    }
  }, [searchInput, fetchChecklist]);

  const handleBack = useCallback(() => {
    setSelectedEvent(null);
    setChecklist([]);
    setChecklistError(null);
  }, []);

  const toggleTask = useCallback((taskId) => {
    setProgress((prev) => {
      const eventKey = selectedEvent?.id;
      if (!eventKey) return prev;
      const eventProgress = prev[eventKey] || {};
      return {
        ...prev,
        [eventKey]: {
          ...eventProgress,
          [taskId]: !eventProgress[taskId],
        },
      };
    });
  }, [selectedEvent]);

  // Compute progress stats
  const completedCount = selectedEvent
    ? checklist.filter((t) => progress[selectedEvent.id]?.[t.id]).length
    : 0;

  // ─── Render: Checklist View ─────────────────────────────────────────────
  if (selectedEvent && checklist.length > 0) {
    // Group tasks by category
    const categories = {};
    checklist.forEach((task) => {
      const cat = task.category || 'Other';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(task);
    });

    return (
      <motion.div
        key="checklist"
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Back + Header */}
        <motion.div variants={fadeUp}>
          <button
            onClick={handleBack}
            className="mb-4 inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-semibold text-secondary transition-colors hover:bg-surface hover:text-primary"
          >
            <ArrowLeft size={14} /> Back to Life Events
          </button>

          <Card elevated className="!p-0 overflow-hidden">
            {/* Gradient header */}
            <div
              className="relative px-6 py-6 sm:px-8 sm:py-7"
              style={{
                background: 'linear-gradient(135deg, var(--color-accent-primary) 0%, #6d52f5 50%, #8b42d8 100%)',
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{selectedEvent.emoji}</span>
                  <div>
                    <h1 className="text-xl font-bold text-white sm:text-2xl">
                      {selectedEvent.label}
                    </h1>
                    <p className="mt-0.5 text-[13px] text-white/70">
                      {selectedEvent.description}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-[12px]">
                  <div className="flex items-center gap-1.5 text-white/80">
                    <ListChecks size={13} />
                    <span className="font-semibold text-white">{checklist.length}</span> tasks
                  </div>
                  <div className="flex items-center gap-1.5 text-white/80">
                    <CheckCircle2 size={13} />
                    <span className="font-semibold text-white">{completedCount}</span> completed
                  </div>
                  {completedCount === checklist.length && checklist.length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-3 py-1 text-[11px] font-semibold text-emerald-200 ring-1 ring-emerald-300/30">
                      <Sparkles size={11} /> All Done! 🎉
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="relative h-2 overflow-hidden rounded-full bg-white/15">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${checklist.length > 0 ? (completedCount / checklist.length) * 100 : 0}%` }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-y-0 left-0 rounded-full bg-white/60"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Task list grouped by category */}
        {Object.entries(categories).map(([category, tasks]) => (
          <motion.div key={category} variants={fadeUp}>
            <div className="mb-3 flex items-center gap-2">
              <span className={cn(
                'inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ring-1',
                CATEGORY_COLORS[category] || CATEGORY_COLORS.Government
              )}>
                {category}
              </span>
              <span className="text-[11px] text-secondary">
                {tasks.filter((t) => progress[selectedEvent.id]?.[t.id]).length}/{tasks.length} completed
              </span>
            </div>
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isChecked={!!progress[selectedEvent.id]?.[task.id]}
                  onToggle={toggleTask}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  // ─── Render: Event Selection View ───────────────────────────────────────
  return (
    <motion.div
      key="selection"
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Page Header */}
      <motion.div variants={fadeUp}>
        <Card elevated className="!p-0 overflow-hidden">
          <div
            className="relative px-6 py-8 sm:px-8 lg:px-10 lg:py-10"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent-primary) 0%, #6d52f5 50%, #8b42d8 100%)',
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full"
              style={{ background: 'rgba(255,255,255,0.06)', filter: 'blur(40px)' }}
            />
            <div className="relative z-10">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/80 backdrop-blur-sm">
                <Compass size={11} /> Life Event Navigator
              </div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl lg:text-[2rem]">
                What's happening in your life?
              </h1>
              <p className="mt-2 max-w-xl text-[14px] text-white/70 leading-relaxed">
                Select a life event or describe your situation — we'll generate a personalized
                checklist of government tasks, required documents, and step-by-step guidance.
              </p>

              {/* Search input */}
              <form onSubmit={handleSearchSubmit} className="mt-6 flex gap-2">
                <div className="relative flex-1 max-w-md">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder='Try "I just got married" or "starting a business"'
                    className="w-full rounded-xl border border-white/20 bg-white/10 py-2.5 pl-10 pr-4 text-[13px] text-white placeholder:text-white/40 backdrop-blur-sm transition-colors focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={searchInput.trim().length < 2}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-xl bg-white px-5 py-2.5 text-[13px] font-semibold text-indigo-700 shadow-lg shadow-black/10 transition-all hover:bg-white/95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Get Checklist
                </motion.button>
              </form>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Error / loading for search */}
      {checklistError && (
        <motion.div variants={fadeUp}>
          <div className="flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-500/5 p-4">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-500" />
            <div>
              <p className="text-[13px] font-medium text-primary">{checklistError}</p>
              <p className="mt-1 text-[11px] text-secondary">
                Try selecting one of the events below, or describe your situation differently.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {checklistLoading && (
        <motion.div variants={fadeUp} className="flex flex-col items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary/20 border-t-accent-primary" />
          <p className="mt-4 text-[12px] font-medium text-secondary">
            Generating your personalized checklist...
          </p>
        </motion.div>
      )}

      {/* Event selection grid */}
      {!checklistLoading && (
        <motion.div variants={fadeUp}>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-primary/15">
              <Compass size={16} className="text-accent-primary" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-primary">Choose a Life Event</h2>
              <p className="text-[11px] text-secondary">Select an event to see your personalized checklist</p>
            </div>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          >
            {events.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                index={index}
                onClick={handleEventSelect}
              />
            ))}
          </motion.div>

          {events.length === 0 && !loading && (
            <div className="rounded-2xl border border-dashed border-border-light bg-surface/50 p-10 text-center">
              <Compass className="mx-auto mb-3 h-8 w-8 text-accent-primary/40" />
              <p className="text-sm font-medium text-primary">Loading life events...</p>
            </div>
          )}
        </motion.div>
      )}

      {/* How it works */}
      {!checklistLoading && (
        <motion.div variants={fadeUp}>
          <Card elevated className="!p-5 sm:!p-6">
            <h3 className="mb-4 flex items-center gap-2 text-[14px] font-semibold text-primary">
              <Sparkles size={15} className="text-accent-primary" />
              How it works
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                {
                  step: '1',
                  title: 'Select your event',
                  desc: 'Choose from common life events or describe your situation in the search box.',
                },
                {
                  step: '2',
                  title: 'Review your checklist',
                  desc: 'Get a personalized list of government tasks with steps and required documents.',
                },
                {
                  step: '3',
                  title: 'Track your progress',
                  desc: 'Check off tasks as you complete them. Your progress is saved automatically.',
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-primary text-[13px] font-bold text-white">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="text-[13px] font-semibold text-primary">{item.title}</h4>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-secondary">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default LifeEventNavigatorPage;
