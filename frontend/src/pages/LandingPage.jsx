import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Sparkles, Bot, Layers, Rocket } from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';

const featureCards = [
  { title: 'AI Citizen Assistant', desc: 'Guided support for schemes, documents, and life events.', icon: Bot },
  { title: 'Predictive Insights', desc: 'Early warnings and opportunity signals across demographics.', icon: Sparkles },
  { title: 'National Infrastructure', desc: 'Role-aware workflows for citizens, NGOs, and administrators.', icon: Layers },
  { title: 'Enterprise Reliability', desc: 'Secure architecture, transparent controls, and audit-ready data.', icon: ShieldCheck },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-base text-primary">
      <header className="sticky top-0 z-20 border-b border-border-light bg-base/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-primary text-xs font-bold text-white">
              C1
            </div>
            <div>
              <p className="text-sm font-semibold">Citizen One</p>
              <p className="text-xs text-secondary">AI Civic Cloud</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 sm:py-14">
        <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="space-y-5">
            <Badge variant="primary">National-scale AI Platform</Badge>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              A trusted citizen platform built for modern digital infrastructure.
            </h1>
            <p className="max-w-xl text-base text-secondary sm:text-lg">
              Citizen One combines guidance AI, benefit intelligence, identity security, and opportunity matching in a
              production-grade SaaS control plane.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/signup"><Button>Get Started <ArrowRight className="ml-1 h-4 w-4" /></Button></Link>
              <Link to="/login"><Button variant="secondary">Login</Button></Link>
              <Link to="/app/dashboard"><Button variant="ghost">Explore Features</Button></Link>
            </div>
          </div>
          <Card elevated className="grid gap-3 sm:grid-cols-2">
            {featureCards.map((f) => (
              <div key={f.title} className="rounded-lg border border-border-light bg-surface/70 p-4">
                <f.icon className="h-5 w-5 text-accent-primary" />
                <p className="mt-2 text-sm font-semibold">{f.title}</p>
                <p className="mt-1 text-sm text-secondary">{f.desc}</p>
              </div>
            ))}
          </Card>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          <Card elevated className="!p-5">
            <p className="text-sm font-semibold">Problem</p>
            <p className="mt-2 text-sm text-secondary">Fragmented government portals force users to restart context on every task.</p>
          </Card>
          <Card elevated className="!p-5">
            <p className="text-sm font-semibold">Solution</p>
            <p className="mt-2 text-sm text-secondary">One intelligent workspace that spans discovery, verification, guidance, and action.</p>
          </Card>
          <Card elevated className="!p-5">
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-accent-primary" />
              <p className="text-sm font-semibold">Why it wins</p>
            </div>
            <p className="mt-2 text-sm text-secondary">SaaS-grade UX, role-based workflows, and predictive orchestration over static forms.</p>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
