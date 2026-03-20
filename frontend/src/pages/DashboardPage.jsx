import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Shield, 
  Award,
  Sparkles,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { Card, Button, Badge } from '../components/ui';

const MetricBlock = ({ title, value, change, icon: Icon, color }) => (
  <Card elevated className="relative overflow-hidden group p-8 flex flex-col justify-between min-h-[160px]">
    <div className={`absolute -right-10 -bottom-10 w-40 h-40 rounded-full blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity bg-${color}`}></div>
    <div className="flex justify-between items-start">
      <h3 className="text-secondary font-black uppercase text-[11px] tracking-widest">{title}</h3>
      <div className={`p-2.5 rounded-xl bg-${color}/10 text-${color}`}>
        <Icon size={20} />
      </div>
    </div>
    <div>
      <p className="text-4xl font-black text-primary tracking-tight leading-none mb-2">{value}</p>
      <div className="flex items-center gap-2">
        <span className="text-emerald-500 font-bold text-xs">+{change}%</span>
        <span className="text-tertiary font-bold text-[10px] uppercase tracking-wider">Since last cycle</span>
      </div>
    </div>
  </Card>
);

const DashboardPage = () => {
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-10 py-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
        <motion.div variants={item} className="space-y-2">
          <Badge variant="primary" className="mb-2">SYSTEM ACTIVE: OPTIMAL</Badge>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-primary">
            Welcome back, <span className="text-accent-primary">Admin</span>
          </h1>
          <p className="text-secondary font-medium mt-2">
            AI sweeps completed. 12 proactive insights ready for review.
          </p>
        </motion.div>
        <motion.div variants={item} className="flex gap-4">
          <Button variant="secondary" className="shadow-none">Run Diagnostics</Button>
          <Button>Generate Report</Button>
        </motion.div>
      </div>

      {/* Primary Metrics Grid */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricBlock title="Citizen Reach" value="2.4M" change="12.4" icon={TrendingUp} color="accent-primary" />
        <MetricBlock title="Benefits Deployed" value="$42M" change="8.1" icon={Award} color="accent-secondary" />
        <MetricBlock title="Identity Security" value="100%" change="0.0" icon={Shield} color="accent-tertiary" />
        <MetricBlock title="Active Anomalies" value="3" change=" -2" icon={AlertCircle} color="amber-500" />
      </motion.div>

      {/* Main Two-Column Layout */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Generative Insights Panel */}
        <div className="col-span-1 lg:col-span-2 space-y-8">
          <Card elevated className="p-10 border-accent-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent-primary/5 blur-[80px] -z-10 group-hover:bg-accent-primary/10 transition-colors"></div>
            
            <div className="flex items-center gap-5 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-accent-primary flex items-center justify-center shadow-lg shadow-accent-primary/30">
                <Bot className="text-white w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-primary">Predictive Infrastructure AI</h2>
                <p className="text-xs uppercase tracking-widest text-secondary font-bold mt-1">Real-time Policy Recommendations</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-surface/50 border border-border-light hover:border-accent-primary/40 transition-colors cursor-pointer group/card">
                <Badge variant="warning" className="mb-4">TRAFFIC ANOMALY</Badge>
                <h3 className="text-lg font-black text-primary mb-2">Sector 7 Congestion Risk</h3>
                <p className="text-sm font-medium text-secondary leading-relaxed mb-6">Simulation predicts severe bottlenecking at the North Bridge between 16:00 and 19:00 today due to unseasonable weather data.</p>
                <div className="flex items-center text-xs font-bold uppercase tracking-widest text-amber-500 group-hover/card:gap-3 transition-all gap-2">
                  Reroute Logistics <ChevronRight size={14} />
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-surface/50 border border-border-light hover:border-accent-tertiary/40 transition-colors cursor-pointer group/card">
                <Badge variant="primary" className="mb-4 text-accent-tertiary bg-accent-tertiary/10">GRANT OPPORTUNITY</Badge>
                <h3 className="text-lg font-black text-primary mb-2">Fund Allocation Available</h3>
                <p className="text-sm font-medium text-secondary leading-relaxed mb-6">National Urban Renewal Grant just opened. Based on our city metrics, we have a 94% probability of securing $2.5M.</p>
                <div className="flex items-center text-xs font-bold uppercase tracking-widest text-accent-tertiary group-hover/card:gap-3 transition-all gap-2">
                  Draft Proposal <ChevronRight size={14} />
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-border-light flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary">Algorithm: C-ONE V4.2</span>
              <Button variant="ghost" className="h-8 text-[10px]">View Analytics Console</Button>
            </div>
          </Card>
        </div>

        {/* Action Feed Side Panel */}
        <div className="col-span-1 space-y-6">
          <Card elevated className="p-8 h-full">
            <h3 className="text-lg font-black tracking-tight text-primary mb-6 flex items-center gap-2">
               <Sparkles className="text-accent-secondary w-5 h-5" /> Active Operations
            </h3>
            
            <div className="space-y-6">
              {[
                { label: 'Citizen Portal V2 Rollout', progress: 78, color: 'bg-accent-primary' },
                { label: 'Smart Grid Maintenance', progress: 42, color: 'bg-amber-500' },
                { label: 'Biometric Security Audit', progress: 15, color: 'bg-accent-secondary' },
              ].map((op, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-primary">{op.label}</span>
                    <span className="text-[10px] font-black uppercase text-secondary">{op.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-border-light rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${op.progress}%` }}
                      className={`h-full rounded-full ${op.color}`}
                    ></motion.div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-border-light space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border-light cursor-pointer hover:border-accent-primary transition-colors group">
                <div className="flex items-center gap-3">
                  <Briefcase size={16} className="text-accent-primary" />
                  <span className="text-sm font-bold text-primary">Pending Vendor Reviews</span>
                </div>
                <div className="w-6 h-6 rounded-full bg-accent-primary/10 text-accent-primary flex items-center justify-center text-[10px] font-black">4</div>
              </div>
            </div>

          </Card>
        </div>

      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;
