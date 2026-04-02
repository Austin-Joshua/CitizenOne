import React, { useState } from 'react';
import { Card, Button, Badge, cn } from '../../components/ui';
import {
  HeartHandshake,
  TrendingUp,
  BrainCircuit,
  Users,
  ShieldAlert,
  Baby,
  Search,
  Sparkles,
  ArrowRight,
  MessageSquare,
  BookOpen,
  MapPin,
  Scale,
  Briefcase,
  PhoneCall
} from 'lucide-react';
import { apiFetch } from '../../lib/api';

const TABS = [
  { id: 'opportunities', label: 'Opportunity Hub', icon: TrendingUp },
  { id: 'skill-engine', label: 'Skill to Income', icon: Sparkles },
  { id: 'mentor', label: 'AI Mentor', icon: BrainCircuit },
  { id: 'support', label: 'Support Network', icon: Users },
  { id: 'safety', label: 'Safety & Legal', icon: ShieldAlert },
  { id: 'mother', label: 'Mother & Child', icon: Baby },
];

export const WomenWorkspace = () => {
  const [activeTab, setActiveTab] = useState('opportunities');

  return (
    <div className="space-y-6 rounded-3xl bg-gradient-to-br from-pink-50 to-transparent p-2 sm:p-6 dark:from-pink-950/20 border border-pink-500/10">
      <Card elevated className="!p-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-tertiary">Women Empowerment Hub</p>
          <p className="mt-1 text-sm text-secondary">A dedicated space for opportunities, growth, safety, and community support.</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 overflow-x-auto pb-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap rounded-[10px] px-3 py-2 text-[13px] font-medium transition-colors',
                  isActive
                    ? 'bg-accent-primary text-white shadow-sm'
                    : 'bg-surface border border-border-light text-secondary hover:bg-base/50 hover:text-primary'
                )}
              >
                <Icon size={16} aria-hidden />
                {tab.label}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Tab Content */}
      {activeTab === 'opportunities' && <OpportunityHub />}
      {activeTab === 'skill-engine' && <SkillToIncomeEngine />}
      {activeTab === 'mentor' && <AiMentor />}
      {activeTab === 'support' && <SupportNetwork />}
      {activeTab === 'safety' && <SafetyLegal />}
      {activeTab === 'mother' && <MotherChild />}
    </div>
  );
};

const OpportunityHub = () => {
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleApply = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulating form data collection
    const formData = new FormData(e.target);
    const payload = {
      type: 'scheme_application',
      title: `Application for ${selectedScheme.title}`,
      description: formData.get('description') || 'Automated application from Women Empowerment Hub',
      priority: 'high',
      metadata: { category: selectedScheme.category }
    };

    try {
      const res = await apiFetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSelectedScheme(null);
          setSuccess(false);
        }, 3000);
      } else {
        alert('Failed to register. Please try again.');
      }
    } catch(err) {
      console.error(err);
      alert('Network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[
        { title: 'Women Entrepreneurship Scheme', category: 'Finance', desc: 'Zero-interest loans up to ₹1,000,000 for female-led startups.', badge: 'Popular' },
        { title: 'Women in Tech Scholarship', category: 'Education', desc: '100% tuition coverage for higher education in STEM fields.', badge: 'Closing Soon' },
        { title: 'Rural Artisan Grant', category: 'Grant', desc: 'Direct market access and capital for traditional female artisans.', badge: 'New' },
        { title: 'Corporate Returnship Program', category: 'Employment', desc: 'For women re-entering the workforce after a career break.', badge: 'Hiring' },
      ].map((opp, i) => (
        <Card key={i} elevated className="!p-5 flex flex-col h-full">
          <div className="flex justify-between items-start">
            <Badge variant="secondary">{opp.category}</Badge>
            <Badge variant={opp.badge === 'Popular' ? 'primary' : 'warning'}>{opp.badge}</Badge>
          </div>
          <h3 className="mt-3 font-semibold text-primary">{opp.title}</h3>
          <p className="mt-1 text-sm text-secondary flex-1">{opp.desc}</p>
          <Button size="sm" className="mt-4 w-fit" onClick={() => setSelectedScheme(opp)}>Apply Now</Button>
        </Card>
      ))}

      {/* Application Form Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card elevated className="w-full max-w-md relative bg-canvas shadow-2xl">
            {success ? (
              <div className="text-center py-8">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 mb-4">
                  <ShieldAlert size={32} className="text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-primary">Registered Successfully</h3>
                <p className="text-sm text-secondary mt-2">Your application for {selectedScheme.title} has been submitted and recorded in the database. You can track this in your dashboard.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-border-light pb-3 mb-4">
                  <h3 className="font-bold text-primary">Register: {selectedScheme.title}</h3>
                  <button onClick={() => setSelectedScheme(null)} className="text-secondary hover:text-primary">&times;</button>
                </div>
                <form onSubmit={handleApply} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-1">Full Name</label>
                    <input required type="text" className="w-full rounded-lg border border-border-light bg-surface px-3 py-2 text-sm focus:ring-1 focus:ring-accent-primary focus:outline-none" placeholder="Enter your full name" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-1">Statement of Purpose</label>
                    <textarea name="description" required className="w-full rounded-lg border border-border-light bg-surface px-3 py-2 text-sm focus:ring-1 focus:ring-accent-primary focus:outline-none" rows={3} placeholder="Briefly state why you need this..."></textarea>
                  </div>
                  <div className="flex gap-2 justify-end mt-6">
                    <Button type="button" variant="ghost" onClick={() => setSelectedScheme(null)}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Registering...' : 'Confirm Registration'}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

const SkillToIncomeEngine = () => {
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const analyze = async () => {
    if (!skills.trim()) return;
    setLoading(true);
    try {
      const res = await apiFetch('/api/women/skill-to-income', {
        method: 'POST',
        body: JSON.stringify({ skills })
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data.pathways);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <Card elevated className="!p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-accent-primary/10 text-accent-primary">
          <Sparkles size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-primary">Skill-to-Income Engine</h3>
          <p className="text-sm text-secondary">Tell us what you are good at, and we'll show you how to earn.</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-primary mb-1">Your Skills & Interests</label>
          <textarea
            className="w-full rounded-lg border border-border-light bg-surface px-3 py-2 text-sm"
            rows={3}
            placeholder="E.g., I know basic sewing, I enjoy cooking, or I know how to use a computer..."
            value={skills}
            onChange={e => setSkills(e.target.value)}
          />
        </div>
        <Button onClick={analyze} disabled={loading || !skills.trim()} className="w-full sm:w-auto">
          {loading ? 'Analyzing Pathways...' : 'Discover Opportunities'}
        </Button>
      </div>

      {results && (
        <div className="mt-6 space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-tertiary">Your Personalized Pathways</p>
          {results.map((r, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-border-light bg-base/30 p-4">
              <div>
                <p className="text-xs uppercase font-medium text-accent-primary tracking-wide">{r.type}</p>
                <p className="font-semibold text-primary mt-1">{r.title}</p>
                <p className="mt-1 text-sm text-secondary">{r.description}</p>
              </div>
              <Button size="sm" variant="secondary" className="shrink-0">{r.action} <ArrowRight size={14} className="ml-1" /></Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

const AiMentor = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I am your AI Mentor. I can help you navigate career decisions, apply for business loans, or suggest local training programs. How can I support you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const msg = input;
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setInput('');
    setIsTyping(true);
    
    try {
      const res = await apiFetch('/api/women/mentor', {
        method: 'POST',
        body: JSON.stringify({ message: msg })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: "I'm having trouble connecting to the network. Please try again later." }]);
    }
    setIsTyping(false);
  };

  return (
    <Card elevated className="flex flex-col h-[600px] !p-0 overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border-light p-4 bg-surface/50">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-primary/10 text-accent-primary">
          <BrainCircuit size={20} />
        </div>
        <div>
          <h3 className="font-medium text-primary">Aura</h3>
          <p className="text-xs text-secondary">Your AI Career & Lifespace Mentor</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={cn('max-w-[85%] rounded-2xl px-4 py-2.5 text-sm', m.role === 'user' ? 'bg-accent-primary text-white ml-auto rounded-tr-sm' : 'bg-surface border border-border-light text-primary mr-auto rounded-tl-sm')}>
            {m.text}
          </div>
        ))}
        {isTyping && (
          <div className="max-w-[85%] bg-surface border border-border-light mr-auto rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce delay-100" />
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce delay-200" />
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce delay-300" />
          </div>
        )}
      </div>
      
      <div className="border-t border-border-light p-4 bg-surface">
        <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
          <input
            type="text"
            className="flex-1 rounded-full border border-border-light bg-base px-4 py-2 text-sm focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
            placeholder="Ask about loans, career advice, or safety..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <Button type="submit" disabled={isTyping || !input.trim()} className="rounded-full px-5">Ask</Button>
        </form>
      </div>
    </Card>
  );
};

const SupportNetwork = () => (
  <Card elevated className="!p-5">
    <div className="mb-4">
      <h3 className="font-semibold text-primary">Community & Support Network</h3>
      <p className="text-sm text-secondary">Connect with local Self-Help Groups (SHGs) and mentoring networks.</p>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[
        { name: 'Pragati Women’s SHG', type: 'Handicrafts & Textiles', location: 'Local Ward', members: 42 },
        { name: 'Tech Sisters', type: 'Digital Mentorship', location: 'Online', members: 1250 },
        { name: 'Agri-Preneur Network', type: 'Agriculture', location: 'District Level', members: 310 },
      ].map((g, i) => (
        <div key={i} className="rounded-lg border border-border-light bg-surface p-4 text-center flex flex-col h-full">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-primary/10 text-accent-primary mb-3">
            <Users size={20} />
          </div>
          <p className="font-medium text-primary">{g.name}</p>
          <p className="text-xs text-secondary mt-1">{g.type} · {g.location}</p>
          <Badge variant="secondary" className="mx-auto mt-2">{g.members} Members</Badge>
          <Button size="sm" variant="secondary" className="w-full mt-4">Request Join</Button>
        </div>
      ))}
    </div>
  </Card>
);

const SafetyLegal = () => {
  const [reportDesc, setReportDesc] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guidance, setGuidance] = useState(null);

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Speech recognition is not supported in this browser.');
    const rec = new SpeechRecognition();
    rec.lang = 'en-US';
    rec.onstart = () => setIsListening(true);
    rec.onresult = (e) => setReportDesc(e.results[0][0].transcript);
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    rec.start();
  };

  const submitIncident = async (e) => {
    e.preventDefault();
    if (!reportDesc.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await apiFetch('/api/women/incident', {
        method: 'POST',
        body: JSON.stringify({ description: reportDesc, anonymous: isAnonymous })
      });
      if (res.ok) {
        const data = await res.json();
        setGuidance(data.guidance);
      }
    } catch {
      alert('Unable to reach the safety server. Please call emergency services directly.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Emergency Header */}
      <Card elevated className="!p-5 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-red-600 dark:text-red-500 flex items-center gap-2">
              <ShieldAlert size={24} /> Emergency Panic Button
            </h3>
            <p className="text-sm text-secondary mt-1">If you are in immediate danger, use the panic button or call 181.</p>
          </div>
          <div className="flex flex-col gap-2 min-w-[200px]">
            <Button className="bg-red-600 hover:bg-red-700 text-white font-bold tracking-widest text-lg py-6 shadow-red-500/30 shadow-lg">
              CALL 112 / 181
            </Button>
            <Button variant="secondary" className="border-red-200 text-red-600 hover:bg-red-100 dark:border-red-900 dark:hover:bg-red-900/40">
              Silent SMS Alert to Contacts
            </Button>
          </div>
        </div>
      </Card>

      {/* Incident Reporting & Case Routing */}
      <h3 className="text-[14px] font-semibold uppercase tracking-wider text-tertiary border-b border-border-light pb-2">Record an Incident</h3>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr]">
        <Card elevated className="!p-5 border border-border-light">
          <h3 className="font-semibold text-primary mb-1">Report & Receive AI Guidance</h3>
          <p className="text-sm text-secondary mb-4">Describe the situation securely. We will route you to the correct legal or medical pathway immediately.</p>
          
          <form onSubmit={submitIncident} className="space-y-4">
            <div className="relative">
              <textarea
                value={reportDesc}
                onChange={(e) => setReportDesc(e.target.value)}
                className="w-full rounded-xl border border-border-light bg-surface px-4 py-3 text-[15px] focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none min-h-[140px]"
                placeholder="Describe what happened here..."
                required
              />
              <button
                type="button"
                onClick={handleVoiceInput}
                className={cn('absolute bottom-3 right-3 p-2 rounded-full transition-colors', isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-base text-secondary hover:text-primary border border-border-light shadow-sm')}
                title="Speak to type"
              >
                <Sparkles size={16} />
              </button>
            </div>
            
            <div className="flex items-center justify-between mt-2 flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-secondary">
                <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} className="rounded text-accent-primary focus:ring-accent-primary/20" />
                Keep this report strictly Anonymous
              </label>
              <Button type="submit" disabled={isSubmitting || !reportDesc.trim()}>
                {isSubmitting ? 'Analyzing...' : 'Generate Guidance Plan'}
              </Button>
            </div>
          </form>

          {guidance && (
            <div className="mt-6 border-t border-border-light pt-6 animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-tertiary">AI Case Routing</p>
                <Badge variant={guidance.classification === 'CRITICAL' ? 'warning' : 'primary'}>{guidance.routeTo}</Badge>
              </div>
              <ul className="space-y-3">
                {guidance.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-primary bg-surface/50 p-3 rounded-lg border border-border-light">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-primary text-[10px] font-bold text-white">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {guidance.helplines.map((hl, i) => (
                  <Badge key={i} variant="secondary" className="whitespace-nowrap px-3 py-1 flex items-center gap-1.5 border border-border-light bg-surface">
                    <b className="text-accent-primary">{hl.number}</b> — {hl.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card elevated className="!p-5 bg-surface/30">
            <h3 className="font-semibold text-primary mb-3 text-[15px]">Counselling & Support</h3>
            <p className="text-sm text-secondary mb-4">You shouldn't have to face trauma alone. Access free, verified mental health professionals.</p>
            <div className="space-y-2">
              <Button variant="secondary" className="w-full justify-start text-left"><MapPin size={16} className="mr-2 opacity-70" /> Nearest Women's Shelter</Button>
              <Button variant="secondary" className="w-full justify-start text-left"><MessageSquare size={16} className="mr-2 opacity-70" /> Book Free Tele-Counselling</Button>
            </div>
          </Card>
          
          <Card elevated className="!p-5 flex-1 h-full">
            <h3 className="font-semibold text-primary mb-3 text-[15px]">Know Your Legal Rights</h3>
            <div className="space-y-4">
              {[
                { title: 'Zero FIR Rights', desc: 'You can file a First Information Report at any police station regardless of jurisdiction.' },
                { title: 'POSH Act 2013', desc: 'Protections against sexual harassment in the workplace with internal compliance.' },
                { title: 'Protection of Identity', desc: 'Your identity is strictly protected under Section 228A IPC in assault cases.' }
              ].map((r, i) => (
                <div key={i} className="text-sm border-l-2 border-border-light pl-3 hover:border-accent-primary transition-colors cursor-pointer">
                  <p className="font-medium text-primary">{r.title}</p>
                  <p className="text-secondary text-[13px] mt-0.5">{r.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
      
      {/* Lawyer Matching System */}
      <h3 className="text-[14px] font-semibold uppercase tracking-wider text-tertiary border-b border-border-light pb-2 mt-8">Legal Representation Matching</h3>
      <LawyerMatchingSystem />
    </div>
  );
};

const LawyerMatchingSystem = () => {
  const [caseType, setCaseType] = useState('Domestic Violence');
  const [isSearching, setIsSearching] = useState(false);
  const [matches, setMatches] = useState(null);

  const findLawyers = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    try {
      const res = await apiFetch('/api/women/lawyers', {
        method: 'POST',
        body: JSON.stringify({ caseType })
      });
      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches);
      } else {
        alert('Failed to fetch legal professionals.');
      }
    } catch {
      alert('Network error.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
      <Card elevated className="!p-5 border border-border-light text-sm">
        <h3 className="font-semibold text-primary mb-2 flex items-center gap-2"><Scale size={18} className="text-accent-primary" /> Find a Lawyer</h3>
        <p className="text-secondary mb-4">Our intelligent system matches you with verified lawyers based on their past case expertise and success history.</p>
        <form onSubmit={findLawyers} className="space-y-3">
           <div>
             <label className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-1">Case Type / Issue</label>
             <select value={caseType} onChange={e => setCaseType(e.target.value)} className="w-full rounded-lg border border-border-light bg-surface px-3 py-2 text-sm focus:border-accent-primary focus:outline-none">
               <option value="Domestic Violence">Domestic Violence</option>
               <option value="Sexual Harassment (Workplace)">Sexual Harassment (Workplace)</option>
               <option value="Divorce & Maintenance">Divorce & Maintenance</option>
               <option value="Cyber Harassment">Cyber Harassment</option>
             </select>
           </div>
           <Button type="submit" disabled={isSearching} className="w-full">{isSearching ? 'Matching...' : 'Find Matches'}</Button>
        </form>
      </Card>
      
      <div className="space-y-4">
        {matches ? (
          matches.map((lawyer, i) => (
            <Card key={i} elevated className="!p-4 border-l-4 border-l-pink-500">
               <div className="flex justify-between items-start">
                 <div>
                   <h4 className="font-bold text-primary flex items-center gap-2">
                     <Briefcase size={16} className="text-pink-600" /> {lawyer.name}
                   </h4>
                   <p className="text-xs text-secondary mt-1">{lawyer.type}</p>
                 </div>
                 <div className="text-right">
                   <p className="text-xs uppercase font-semibold text-tertiary tracking-wide">Success Rate</p>
                   <p className="text-xl font-bold text-green-600">{lawyer.success}</p>
                 </div>
               </div>
               
               <div className="mt-3 flex gap-4 text-sm text-secondary border-t border-border-light pt-3">
                 <p><span className="font-medium text-primary">{lawyer.cases}</span> Cases Handled</p>
                 <p><span className="font-medium text-primary">{lawyer.exp}</span> Experience</p>
               </div>
               
               <div className="mt-3 flex items-center justify-between">
                 <div className="flex gap-2">
                   {lawyer.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                 </div>
                 <Button size="sm" className="bg-pink-600 hover:bg-pink-700 text-white gap-2"><PhoneCall size={14} /> Request Consult</Button>
               </div>
            </Card>
          ))
        ) : (
          <Card elevated className="!p-5 border-dashed bg-base/50 flex flex-col items-center justify-center h-full text-center min-h-[200px]">
             <Scale size={32} className="text-secondary/40 mb-3" />
             <p className="text-sm text-secondary">Select your case type to see highly recommended legal experts matching your profile.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

const MotherChild = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {[
      { title: 'Janani Suraksha Yojana', desc: 'Cash assistance for institutional delivery to improve infant mortality.', icon: Baby },
      { title: 'Poshan Abhiyaan', desc: 'Nutritional support program for pregnant women and lactating mothers.', icon: HeartHandshake },
      { title: 'Matritva Vandana', desc: 'Wage-loss compensation for working mothers during pregnancy.', icon: TrendingUp },
    ].map((s, i) => {
      const Icon = s.icon;
      return (
        <Card key={i} elevated className="!p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 mb-3">
            <Icon size={20} />
          </div>
          <h3 className="font-semibold text-primary">{s.title}</h3>
          <p className="mt-1 text-sm text-secondary">{s.desc}</p>
          <Button size="sm" variant="secondary" className="mt-4">Check Eligibility</Button>
        </Card>
      );
    })}
  </div>
);
