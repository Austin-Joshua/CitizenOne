import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  FileText,
  ListOrdered,
  IndianRupee,
  Clock,
  ExternalLink,
  MapPin,
  Phone,
  Copy,
  Check,
  Sparkles,
  AlertTriangle,
  BookOpen,
  Shield,
} from 'lucide-react';
import { cn } from '../ui';

// ─── Section toggle ─────────────────────────────────────────────────────────
const Section = ({ icon: Icon, iconClass, title, defaultOpen = false, children, badge }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-xl border border-border-light/60 bg-surface/30 transition-colors hover:border-border-light">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors hover:bg-surface/60"
        aria-expanded={open}
      >
        <div className={cn('flex h-6 w-6 items-center justify-center rounded-lg shrink-0', iconClass || 'bg-accent-primary/15 text-accent-primary')}>
          <Icon size={12} strokeWidth={2.5} aria-hidden />
        </div>
        <span className="flex-1 text-[12px] font-semibold text-primary">{title}</span>
        {badge && (
          <span className="rounded-full bg-accent-primary/10 px-2 py-0.5 text-[10px] font-bold text-accent-primary">
            {badge}
          </span>
        )}
        <ChevronDown
          size={13}
          className={cn('shrink-0 text-secondary transition-transform duration-200', open && 'rotate-180')}
          aria-hidden
        />
      </button>
      <div
        className={cn(
          'grid transition-all duration-200 ease-out',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <div className="px-3.5 pb-3 pt-1">{children}</div>
        </div>
      </div>
    </div>
  );
};

// ─── Copy button helper ─────────────────────────────────────────────────────
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="ml-auto shrink-0 rounded-md p-1 text-secondary/50 transition-colors hover:bg-surface hover:text-secondary"
      title="Copy steps"
    >
      {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
    </button>
  );
};

// ─── Main AIResponseCard ────────────────────────────────────────────────────
const AIResponseCard = ({ data, relatedSchemes, onSuggestionClick }) => {
  if (!data) return null;

  const isScheme = data.type === 'scheme_guidance';
  const isDocument = data.type === 'document_simplified';
  const isGeneral = data.type === 'general_guidance';
  const isGreeting = data.type === 'greeting';
  const isUncertain = data.type === 'uncertain';

  // ── Greeting / simple text ──
  if (isGreeting) {
    return (
      <div className="space-y-1">
        <p className="text-[13px] leading-relaxed text-primary">{data.summary}</p>
      </div>
    );
  }

  // ── Uncertain / fallback ──
  if (isUncertain) {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-2 rounded-xl bg-amber-500/8 p-3 ring-1 ring-amber-400/15">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-500" />
          <p className="text-[12px] leading-relaxed text-primary">{data.summary}</p>
        </div>
        {data.steps?.length > 0 && (
          <div className="space-y-1.5 pl-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-secondary">Suggestions</p>
            {data.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-accent-primary/10 text-[9px] font-bold text-accent-primary mt-0.5">
                  {i + 1}
                </span>
                <span className="text-[12px] leading-snug text-secondary">{step}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── General guidance ──
  if (isGeneral) {
    return (
      <div className="space-y-3">
        <p className="text-[13px] leading-relaxed text-primary">{data.summary}</p>
        {data.steps?.length > 0 && (
          <div className="space-y-1.5">
            {data.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-primary/10 text-[10px] font-bold text-accent-primary mt-0.5">
                  {i + 1}
                </div>
                <span className="text-[12px] leading-snug text-primary/90">{step}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Document simplified ──
  if (isDocument) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl bg-violet-500/8 p-3 ring-1 ring-violet-400/15">
          <div className="mb-1.5 flex items-center gap-1.5">
            <BookOpen size={12} className="text-violet-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">Simplified Summary</span>
            {data.stats && (
              <span className="ml-auto text-[9px] font-medium text-secondary/60">{data.stats.wordCount} words · {data.stats.readingTime}</span>
            )}
          </div>
          <p className="text-[12px] leading-relaxed text-primary">{data.summary}</p>
        </div>

        {data.keyBenefits?.length > 0 && (
          <Section icon={IndianRupee} iconClass="bg-emerald-500/15 text-emerald-500" title="Key Benefits" defaultOpen badge={data.keyBenefits.length}>
            <div className="space-y-1.5">
              {data.keyBenefits.map((b, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 size={11} className="mt-0.5 shrink-0 text-emerald-500" />
                  <span className="text-[11px] leading-snug text-primary/90">{b}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {data.actions?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {data.actions.map((action, i) => (
              <button
                key={i}
                onClick={() => onSuggestionClick?.(action)}
                className="rounded-lg bg-accent-primary/8 px-2.5 py-1 text-[10px] font-semibold text-accent-primary ring-1 ring-accent-primary/15 transition-all hover:bg-accent-primary/15"
              >
                {action}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Scheme guidance (main structured response) ──
  if (isScheme) {
    return (
      <div className="space-y-2.5">
        {/* Scheme header */}
        <div className="rounded-xl bg-gradient-to-r from-accent-primary/10 to-violet-500/8 p-3 ring-1 ring-accent-primary/15">
          <div className="mb-1 flex items-center gap-1.5">
            <Sparkles size={11} className="text-accent-primary" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent-primary">
              {data.governmentLevel === 'state' ? 'State Scheme' : 'National Scheme'}
            </span>
            {data.category && (
              <span className="ml-auto rounded-full bg-accent-primary/10 px-2 py-0.5 text-[9px] font-bold text-accent-primary">
                {data.category}
              </span>
            )}
          </div>
          <h4 className="text-[14px] font-bold leading-snug text-primary">{data.schemeName}</h4>
          <p className="mt-1 text-[12px] leading-relaxed text-secondary">{data.summary}</p>
          {data.ministry && (
            <p className="mt-1.5 text-[10px] font-medium text-secondary/60">
              <Shield size={9} className="mr-1 inline" />{data.ministry}
            </p>
          )}
        </div>

        {/* Benefits */}
        {data.benefits && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/8 px-3 py-2 ring-1 ring-emerald-400/15">
            <IndianRupee size={13} className="shrink-0 text-emerald-500" />
            <span className="text-[12px] font-semibold text-emerald-600 leading-snug">{data.benefits}</span>
          </div>
        )}

        {/* Eligibility */}
        {data.eligibility?.length > 0 && (
          <Section icon={CheckCircle2} iconClass="bg-blue-500/15 text-blue-400" title="Who Can Apply" defaultOpen badge={data.eligibility.length}>
            <div className="space-y-1.5">
              {data.eligibility.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <ChevronRight size={10} className="mt-0.5 shrink-0 text-blue-400" />
                  <span className="text-[11px] leading-snug text-primary/90">{item}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Documents */}
        {data.documents?.length > 0 && (
          <Section icon={FileText} iconClass="bg-violet-500/15 text-violet-400" title="Documents Required" badge={data.documents.length}>
            <div className="space-y-1.5">
              {data.documents.map((doc, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={cn(
                    'h-1.5 w-1.5 rounded-full shrink-0',
                    doc.required ? 'bg-red-500' : 'bg-slate-400'
                  )} />
                  <span className="text-[11px] text-primary/90">{doc.label}</span>
                  {doc.category && <span className="ml-auto text-[9px] font-medium text-secondary/50">{doc.category}</span>}
                  {doc.required && <span className="text-[8px] font-bold uppercase text-red-500/70">Required</span>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Steps */}
        {data.steps?.length > 0 && (
          <Section icon={ListOrdered} iconClass="bg-amber-500/15 text-amber-500" title="Step-by-Step Process" badge={data.steps.length}>
            <div className="space-y-2">
              {data.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-[10px] font-bold text-amber-500 mt-0.5">
                    {i + 1}
                  </div>
                  <span className="text-[11px] leading-snug text-primary/90">{step}</span>
                </div>
              ))}
              <CopyButton text={data.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')} />
            </div>
          </Section>
        )}

        {/* Additional info row */}
        <div className="flex flex-wrap gap-1.5">
          {data.processingDays && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-surface px-2 py-1 text-[10px] font-medium text-secondary ring-1 ring-border-light">
              <Clock size={9} /> ~{data.processingDays} days processing
            </span>
          )}
          {data.applicationMode && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-surface px-2 py-1 text-[10px] font-medium text-secondary ring-1 ring-border-light">
              <MapPin size={9} /> {data.applicationMode}
            </span>
          )}
          {data.deadline && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-red-500/8 px-2 py-1 text-[10px] font-semibold text-red-500 ring-1 ring-red-400/20">
              <Clock size={9} /> Deadline: {new Date(data.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>

        {/* Official link */}
        {data.officialLink && (
          <a
            href={data.officialLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent-primary/8 px-3 py-1.5 text-[11px] font-semibold text-accent-primary ring-1 ring-accent-primary/15 transition-all hover:bg-accent-primary/15"
          >
            <ExternalLink size={10} /> Visit Official Website
          </a>
        )}

        {/* Where to apply */}
        {data.whereToApply && (
          <p className="text-[10px] leading-relaxed text-secondary/70">
            <MapPin size={9} className="mr-1 inline" />{data.whereToApply}
          </p>
        )}

        {/* Support contacts */}
        {data.supportContacts?.length > 0 && (
          <div className="rounded-lg bg-surface/40 px-3 py-2 ring-1 ring-border-light/40">
            {data.supportContacts.map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px] text-secondary">
                <Phone size={9} className="text-accent-primary" />
                <span className="font-medium">{c.name}</span>
                {c.phone && <span className="text-accent-primary font-semibold">{c.phone}</span>}
              </div>
            ))}
          </div>
        )}

        {/* Related schemes */}
        {relatedSchemes?.length > 0 && (
          <div className="mt-1 space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-secondary/60">Related Schemes</p>
            {relatedSchemes.map((rs) => (
              <button
                key={rs.schemeId}
                onClick={() => onSuggestionClick?.(`Tell me about ${rs.schemeName}`)}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition-all hover:bg-surface ring-1 ring-border-light/30"
              >
                <Sparkles size={9} className="shrink-0 text-accent-primary/60" />
                <span className="flex-1 text-[11px] font-medium text-primary/80 line-clamp-1">{rs.schemeName}</span>
                <span className="shrink-0 text-[9px] font-bold text-secondary/50">{rs.matchScore}%</span>
              </button>
            ))}
          </div>
        )}

        {/* Quick navigation */}
        <div className="flex gap-2 pt-1">
          <Link
            to="/app/benefits"
            className="rounded-lg bg-accent-primary/10 px-2.5 py-1 text-[10px] font-semibold text-accent-primary transition-colors hover:bg-accent-primary/20"
          >
            Browse All Schemes
          </Link>
          <Link
            to="/app/vault"
            className="rounded-lg bg-violet-500/10 px-2.5 py-1 text-[10px] font-semibold text-violet-500 transition-colors hover:bg-violet-500/20"
          >
            Upload Documents
          </Link>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <p className="text-[13px] leading-relaxed text-primary">{data.summary || JSON.stringify(data)}</p>
  );
};

export default AIResponseCard;
