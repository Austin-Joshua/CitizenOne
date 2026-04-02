import React, { useState } from 'react';
import { Card, Button, Badge, cn } from '../../components/ui';
import { BookOpen, Target, BrainCircuit, Search, Rocket, FileText, Download, Award, ArrowRight, GraduationCap } from 'lucide-react';
import { apiFetch } from '../../lib/api';

const TABS = [
  { id: 'exam', label: 'Exam Roadmaps', icon: Target },
  { id: 'foundation', label: 'Foundation Awareness', icon: BookOpen },
  { id: 'opportunity', label: 'Student Opportunities', icon: Search },
  { id: 'colleges', label: 'College Decision', icon: GraduationCap },
  { id: 'mentor', label: 'AI Study Mentor', icon: BrainCircuit },
];

export const StudentWorkspace = () => {
  const [activeTab, setActiveTab] = useState('exam');

  return (
    <div className="space-y-6">
      <Card elevated className="!p-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-tertiary">Student Hub</p>
          <p className="mt-1 text-sm text-secondary">A dedicated portal for competitive exam roadmaps, scholarship applications, and career awareness.</p>
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
      {activeTab === 'exam' && <ExamSupport />}
      {activeTab === 'foundation' && <FoundationAwareness />}
      { activeTab === 'opportunity' && <OpportunityDiscovery /> }
      { activeTab === 'colleges' && <CollegeDecisionSystem /> }
      { activeTab === 'mentor' && <AiMentor /> }
    </div>
  );
};

const ExamSupport = () => (
  <div className="grid gap-6 md:grid-cols-2">
    <Card elevated className="!p-5 border border-border-light flex flex-col">
      <div className="flex justify-between items-start mb-3">
        <Badge variant="primary">NEET UG</Badge>
        <span className="text-xs text-secondary font-medium tracking-wider">MEDICAL</span>
      </div>
      <h3 className="text-xl font-bold text-primary mb-2">NEET Preparation Roadmap</h3>
      <p className="text-sm text-secondary mb-4 flex-1">A strictly curated roadmap focusing on NCERT biology fundamentals, high-yield physics patterns, and mock strategies for securing 650+.</p>
      
      <div className="space-y-3 mb-6 bg-surface/30 p-3 rounded-lg border border-border-light">
        <div className="flex items-center gap-2 text-sm text-primary"><CheckCircle className="text-accent-primary" size={16} /> Phase 1: NCERT Dominance</div>
        <div className="flex items-center gap-2 text-sm text-primary"><CheckCircle className="text-accent-primary" size={16} /> Phase 2: PyQ & Concept Synthesis</div>
        <div className="flex items-center gap-2 text-sm text-primary"><CheckCircle className="text-accent-primary" size={16} /> Phase 3: Simulated Mocks</div>
      </div>
      
      <div className="flex gap-2 mt-auto">
        <Button className="w-full">Unlock Complete Roadmap</Button>
      </div>
    </Card>

    <Card elevated className="!p-5 border border-border-light flex flex-col">
      <div className="flex justify-between items-start mb-3">
        <Badge variant="warning">UPSC CSE</Badge>
        <span className="text-xs text-secondary font-medium tracking-wider">CIVIL SERVICES</span>
      </div>
      <h3 className="text-xl font-bold text-primary mb-2">UPSC Foundation Strategy</h3>
      <p className="text-sm text-secondary mb-4 flex-1">Decode the syllabus and master answer writing. Access our AI-curated standard booklist mapped against previous year trends.</p>
      
      <div className="space-y-3 mb-6 bg-surface/30 p-3 rounded-lg border border-border-light">
        <div className="flex items-center gap-2 text-sm text-primary"><CheckCircle className="text-accent-primary" size={16} /> Phase 1: Macro Syllabus & News</div>
        <div className="flex items-center gap-2 text-sm text-primary"><CheckCircle className="text-accent-primary" size={16} /> Phase 2: Standard Books Deep Dive</div>
        <div className="flex items-center gap-2 text-sm text-primary"><CheckCircle className="text-accent-primary" size={16} /> Phase 3: Ethics & Essay Writing</div>
      </div>
      
      <div className="flex gap-2 mt-auto">
        <Button className="w-full">Unlock Complete Roadmap</Button>
      </div>
    </Card>
  </div>
);

const CheckCircle = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);

const FoundationAwareness = () => (
  <Card elevated className="!p-5">
    <div className="flex items-center gap-3 mb-4 border-b border-border-light pb-4">
      <div className="p-2 rounded-lg bg-accent-primary/10 text-accent-primary">
        <Rocket size={24} />
      </div>
      <div>
        <h3 className="font-semibold text-primary">Early Career Foundation</h3>
        <p className="text-sm text-secondary">Discover streams, understand futuristic industries, and map your higher education path.</p>
      </div>
    </div>
    
    <div className="grid gap-4 md:grid-cols-3 mt-4">
      {[
        { title: 'STEM Pathways', desc: 'AI, Data Science, Biotech, and Engineering core paths.' },
        { title: 'Commerce & FinTech', desc: 'CA, Actuarial Science, Analytics, and Economics.' },
        { title: 'Humanities & Law', desc: 'Public Policy, Corporate Law, Journalism, and Design.' }
      ].map((f, i) => (
        <div key={i} className="p-4 rounded-xl border border-border-light bg-surface hover:border-accent-primary transition-colors cursor-pointer block">
          <Award className="text-accent-primary mb-2" size={20} />
          <p className="font-medium text-primary text-sm">{f.title}</p>
          <p className="text-xs text-secondary mt-1">{f.desc}</p>
        </div>
      ))}
    </div>
  </Card>
);

const OpportunityDiscovery = () => (
  <div className="space-y-4">
    <Card elevated className="!p-5 border-l-4 border-l-accent-primary">
       <h3 className="font-bold text-primary mb-1">National Scholarship Portal Integration</h3>
       <p className="text-sm text-secondary">Your linked student profile makes you eligible for 4 high-value scholarships. Review and apply below.</p>
    </Card>
    
    <div className="grid gap-4 sm:grid-cols-2">
      {[
        { title: 'Post-Matric Scholarship for Minorities', provider: 'Ministry of Minority Affairs', type: 'Government Scheme' },
        { title: 'Central Sector Scheme of Scholarships', provider: 'Dept of Higher Education', type: 'Government Scheme' },
        { title: 'Vidyadhan Scholarship Program', provider: 'Sarojini Damodaran Foundation', type: 'Private Trust' },
        { title: 'Inspire Scholarship for Science', provider: 'Dept of Science & Technology', type: 'Merit-Based' }
      ].map((s, i) => (
        <Card key={i} elevated className="!p-5 flex flex-col">
          <Badge variant="secondary" className="w-fit mb-3">{s.type}</Badge>
          <h3 className="font-semibold text-primary">{s.title}</h3>
          <p className="text-sm text-secondary mt-1 flex-1">{s.provider}</p>
          <Button variant="secondary" size="sm" className="mt-4 w-full justify-between">
            View Requirements <ArrowRight size={14} />
          </Button>
        </Card>
      ))}
    </div>
  </div>
);

const AiMentor = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Welcome to your Study Mentor. Send me your queries regarding career choices, syllabus confusion, or scholarship eligibility!' }
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
      const res = await apiFetch('/api/student/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: "I'm offline right now." }]);
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
          <h3 className="font-medium text-primary">Scholar AI</h3>
          <p className="text-xs text-secondary">Academic Guidance & Roadmaps</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={cn('max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap', m.role === 'user' ? 'bg-accent-primary text-white ml-auto rounded-tr-sm' : 'bg-surface border border-border-light text-primary mr-auto rounded-tl-sm')}>
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
            placeholder="Ask about NEET strategy..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <Button type="submit" disabled={isTyping || !input.trim()} className="rounded-full px-5">Ask</Button>
        </form>
      </div>
    </Card>
  );
};

const CollegeDecisionSystem = () => {
  const [marks10, setMarks10] = useState('');
  const [marks12, setMarks12] = useState('');
  const [cutoff, setCutoff] = useState('');
  const [results, setResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const simulateSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    try {
      const res = await apiFetch('/api/student/colleges', {
        method: 'POST',
        body: JSON.stringify({ marks10, marks12, cutoff })
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data.matches);
      } else {
        alert('Failed to analyze eligibility.');
      }
    } catch {
      alert('Network error.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
      <Card elevated className="!p-5">
        <h3 className="font-semibold text-primary mb-1 text-lg">College Decision System</h3>
        <p className="text-sm text-secondary mb-4">Input your academic performance to discover the best-fit colleges and recommended courses you are eligible for.</p>
        <form onSubmit={simulateSearch} className="space-y-4">
          <div>
             <label className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-1">10th Marks (%)</label>
             <input required type="number" step="0.1" value={marks10} onChange={e => setMarks10(e.target.value)} className="w-full rounded-lg border border-border-light bg-surface px-4 py-2 text-sm focus:border-accent-primary focus:outline-none" placeholder="e.g. 85.5" />
          </div>
          <div>
             <label className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-1">12th Marks (%)</label>
             <input required type="number" step="0.1" value={marks12} onChange={e => setMarks12(e.target.value)} className="w-full rounded-lg border border-border-light bg-surface px-4 py-2 text-sm focus:border-accent-primary focus:outline-none" placeholder="e.g. 88.0" />
          </div>
          <div>
             <label className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-1">Entrance Cut-off Score</label>
             <input type="number" value={cutoff} onChange={e => setCutoff(e.target.value)} className="w-full rounded-lg border border-border-light bg-surface px-4 py-2 text-sm focus:border-accent-primary focus:outline-none" placeholder="e.g. 140" />
          </div>
          <Button type="submit" disabled={isSearching || !marks10 || !marks12} className="w-full">
            {isSearching ? 'Analyzing Eligibility...' : 'Find Colleges'}
          </Button>
        </form>
      </Card>

      <div>
        {results ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
             <div className="flex items-center gap-2 mb-2">
               <GraduationCap className="text-accent-primary" size={24} />
               <h3 className="font-semibold text-primary text-xl">Recommended Opportunities</h3>
             </div>
             <div className="grid gap-4">
               {results.map((r, i) => (
                 <Card key={i} elevated className="!p-4 border-l-4 border-l-accent-primary">
                    <div className="flex justify-between items-start">
                      <Badge variant="secondary">{r.type}</Badge>
                      <Badge variant={r.eligibility === 'High Match' ? 'primary' : 'default'} className={r.eligibility === 'Guaranteed' ? 'bg-green-500 text-white' : ''}>{r.eligibility}</Badge>
                    </div>
                    <h4 className="font-bold text-primary mt-2">{r.name}</h4>
                    <p className="text-sm text-secondary mt-1">Recommended Course: <span className="font-medium text-primary">{r.course}</span></p>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="secondary" className="w-full sm:w-auto">View Cut-off Trends</Button>
                    </div>
                 </Card>
               ))}
             </div>
          </div>
        ) : (
          <Card elevated className="!p-5 border-dashed bg-base/50 flex flex-col items-center justify-center min-h-[300px] text-center">
             <GraduationCap size={48} className="text-secondary/40 mb-4" />
             <p className="text-sm text-secondary max-w-sm">
                Enter your academic scores on the left to receive personalized college placement and course recommendations matching your profile.
             </p>
          </Card>
        )}
      </div>
    </div>
  );
};

