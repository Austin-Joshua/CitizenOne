import React, { useState } from 'react';
import { Card, Button, Badge, cn } from '../../components/ui';
import { Sprout, LineChart, Sun, Droplets, Calendar, ArrowRight, ShieldAlert } from 'lucide-react';
import { apiFetch } from '../../lib/api';

const TABS = [
  { id: 'agriflux', label: 'AgriFlux Link', icon: Sprout },
  { id: 'insights', label: 'Yield & Cost Insights', icon: LineChart },
];

export const FarmerWorkspace = () => {
  const [activeTab, setActiveTab] = useState('agriflux');

  return (
    <div className="space-y-6">
      <Card elevated className="!p-5 border-t-4 border-t-green-500">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-500/10 text-green-600 rounded-xl">
             <Sprout size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-primary">Farmer Support Hub</h3>
            <p className="text-sm text-secondary mt-1">Connect your farm data to external platforms and predict yield profitability.</p>
          </div>
        </div>
        
        <div className="mt-6 flex flex-wrap gap-2 overflow-x-auto pb-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap rounded-[10px] px-3 py-2 text-[13px] font-medium transition-colors border',
                  isActive
                    ? 'bg-green-600 border-green-600 text-white shadow-sm hover:opacity-90'
                    : 'bg-surface border-border-light text-secondary hover:bg-base/50 hover:text-primary'
                )}
              >
                <Icon size={16} aria-hidden />
                {tab.label}
              </button>
            );
          })}
        </div>
      </Card>

      {activeTab === 'agriflux' && <AgriFluxPanel />}
      {activeTab === 'insights' && <YieldInsights />}
    </div>
  );
};

const AgriFluxPanel = () => (
  <div className="grid gap-6 md:grid-cols-2">
     <Card elevated className="!p-6 flex flex-col justify-center items-center text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-green-400 to-emerald-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-green-500/20">
          <Sprout size={32} />
        </div>
        <h3 className="font-bold text-lg text-primary">AgriFlux Integration Ready</h3>
        <p className="text-sm text-secondary mt-2 mb-6">Seamlessly sync your CitizenOne agricultural profile with the AgriFlux marketplace to receive wholesale seed pricing, direct logistics bridging, and live crop updates.</p>
        <Button className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto px-8">Connect AgriFlux Account</Button>
     </Card>

     <div className="space-y-4">
        <h3 className="font-semibold text-primary text-sm uppercase tracking-wide">Sync Capabilities</h3>
        {[
          { icon: LineChart, label: 'Live Market Pricing Output', desc: 'AgriFlux broadcasts real-time mandi prices back to your terminal.' },
          { icon: Droplets, label: 'Soil Health Logging', desc: 'Sync state laboratory test results directly into AgriFlux models.' },
          { icon: Calendar, label: 'Crop Lifecycle Tracking', desc: 'Automate sowing and harvesting dates.' }
        ].map((feat, i) => (
          <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-border-light bg-surface">
            <div className="p-2 bg-base rounded-md shadow-sm border border-border-light shrink-0 text-accent-primary">
              <feat.icon size={20} />
            </div>
            <div>
              <p className="font-medium text-sm text-primary">{feat.label}</p>
              <p className="text-xs text-secondary mt-1">{feat.desc}</p>
            </div>
          </div>
        ))}
     </div>
  </div>
);

const YieldInsights = () => {
  const [cost, setCost] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [insights, setInsights] = useState(null);

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!cost || isNaN(Number(cost))) return;
    setIsSubmitting(true);
    try {
      const res = await apiFetch('/api/farmer/yield-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: 'Wheat crop, standard cycle', totalCost: Number(cost) })
      });
      if (res.ok) {
        setInsights(await res.json());
      }
    } catch {
      alert("Failed to reach the Agri AI.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
      <Card elevated className="!p-5">
        <h3 className="font-semibold text-primary mb-1">Cost vs. Profit Predictor</h3>
        <p className="text-sm text-secondary mb-4">Input your total estimated expenditure (seeds, fertilizer, labor) for the current cycle.</p>
        
        <form onSubmit={handlePredict} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-1">Total Input Cost (₹)</label>
            <input 
              type="number" 
              required
              value={cost}
              onChange={e => setCost(e.target.value)}
              className="w-full rounded-lg border border-border-light bg-surface px-4 py-2 focus:border-green-500 focus:outline-none" 
              placeholder="e.g. 45000"
            />
          </div>
          <Button type="submit" disabled={isSubmitting || !cost} className="w-full bg-green-600 hover:bg-green-700">
             {isSubmitting ? 'Simulating Market...' : 'Generate Prediction'}
          </Button>
        </form>
      </Card>

      {insights ? (
        <div className="space-y-4 animate-in fade-in duration-300">
           <div className="grid grid-cols-2 gap-4">
             <Card elevated className="!p-5 bg-gradient-to-br from-green-500/10 to-transparent border-green-500/30">
               <p className="text-xs font-semibold uppercase text-secondary">Projected Revenue</p>
               <p className="text-2xl font-bold text-primary mt-1">₹ {insights.projectedRevenue}</p>
               <p className="text-sm text-green-600 font-medium mt-1">+{insights.profitMargin}% Margin</p>
             </Card>
             <Card elevated className="!p-5">
               <p className="text-xs font-semibold uppercase text-secondary">Data Source</p>
               <p className="text-lg font-bold text-primary mt-1">{insights.source}</p>
             </Card>
           </div>
           
           <Card elevated className="!p-5">
             <h4 className="font-semibold text-primary text-sm mb-2">AI Strategic Recommendation</h4>
             <p className="text-[15px] leading-relaxed text-secondary">{insights.recommendation}</p>
             
             {insights.warning && (
               <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex gap-3 text-red-600">
                 <ShieldAlert size={20} className="shrink-0" />
                 <div>
                   <p className="font-bold text-sm">Warning: {insights.warning}</p>
                   <p className="text-xs mt-0.5 opacity-90">Please audit your supply chain costs. Proceed cautiously with excessive pesticide spending.</p>
                 </div>
               </div>
             )}
           </Card>
        </div>
      ) : (
        <Card elevated className="!p-5 flex items-center justify-center border-dashed bg-base/50">
          <p className="text-sm text-secondary text-center max-w-sm">
             Enter your input costs on the left to receive a fully personalized yield projection based on live AgriFlux market parameters.
          </p>
        </Card>
      )}
    </div>
  );
};
