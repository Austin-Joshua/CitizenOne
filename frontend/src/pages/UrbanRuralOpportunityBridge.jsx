
import React, { useState } from 'react';
import { Card, Button, Badge } from '../components/ui';
import { MapPin, Briefcase, Home, GraduationCap, ArrowRight } from 'lucide-react';


const JOBS = [
  { title: 'Factory Worker', city: 'Chennai', salary: '₹15,000/mo' },
  { title: 'Delivery Executive', city: 'Bangalore', salary: '₹18,000/mo' },
  { title: 'Retail Assistant', city: 'Hyderabad', salary: '₹14,000/mo' },
];

const TRAININGS = [
  { name: 'Basic Computer Skills', duration: '2 months', location: 'Online' },
  { name: 'Electrician Training', duration: '3 months', location: 'Chennai' },
  { name: 'Tailoring Course', duration: '1 month', location: 'Bangalore' },
];

const HOUSING = [
  { location: 'Chennai', rent: '₹3,000/mo' },
  { location: 'Bangalore', rent: '₹3,500/mo' },
  { location: 'Hyderabad', rent: '₹2,800/mo' },
];

const MIGRATION_STEPS = [
  'Choose your preferred city and job/skill.',
  'Gather required documents (ID, address proof, certificates).',
  'Arrange travel (bus/train).',
  'Find temporary housing.',
  'Register for skill training or job interviews.',
  'Connect with local support groups.',
];

  const [village, setVillage] = useState('');
  const [city, setCity] = useState('Chennai');
  const [interest, setInterest] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const skillSuggestions = ['Farmer', 'Electrician', 'Tailor', 'Driver', 'Welder', 'Plumber', 'Carpenter', 'Nurse', 'Sales', 'Security', 'Cook'];
  const filteredSkills = interest
    ? skillSuggestions.filter(s => s.toLowerCase().includes(interest.toLowerCase()))
    : skillSuggestions;

  // Filter jobs and training based on city/interest
  const filteredJobs = JOBS.filter(j => !city || j.city === city);
  const filteredTrainings = TRAININGS.filter(t => !city || t.location === city || t.location === 'Online');
  const filteredHousing = HOUSING.filter(h => !city || h.location === city);

  return (
    <div className="space-y-8">
      <Card elevated className="!p-6 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-primary">Urban–Rural Opportunity Bridge</h1>
        <p className="text-secondary">Helping rural citizens discover jobs, training, migration guidance, and housing in cities.</p>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-tertiary mb-1">Current Village</label>
            <input className="rounded-lg border border-border-light bg-surface px-3 py-2 text-sm" value={village} onChange={e => setVillage(e.target.value)} placeholder="Enter your village" />
          </div>
          <div>
            <label className="block text-xs font-medium text-tertiary mb-1">Preferred City</label>
            <select className="rounded-lg border border-border-light bg-surface px-3 py-2 text-sm" value={city} onChange={e => setCity(e.target.value)}>
              <option>Chennai</option>
              <option>Bangalore</option>
              <option>Hyderabad</option>
            </select>
          </div>
          <div className="relative">
            <label className="block text-xs font-medium text-tertiary mb-1">Skill/Interest</label>
            <input
              className="rounded-lg border border-border-light bg-surface px-3 py-2 text-sm"
              value={interest}
              onChange={e => {
                setInterest(e.target.value);
                setShowSkillDropdown(true);
              }}
              onFocus={() => setShowSkillDropdown(true)}
              onBlur={() => setTimeout(() => setShowSkillDropdown(false), 150)}
              placeholder="e.g. tailoring, electrician"
              autoComplete="off"
            />
            {showSkillDropdown && filteredSkills.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-border-light bg-base shadow-lg max-h-40 overflow-y-auto">
                {filteredSkills.map(skill => (
                  <div
                    key={skill}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-accent-primary/10"
                    onMouseDown={() => {
                      setInterest(skill);
                      setShowSkillDropdown(false);
                    }}
                  >
                    {skill}
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 mt-2">
              {['Farmer', 'Electrician', 'Tailor', 'Driver'].map(skill => (
                <Button
                  key={skill}
                  size="sm"
                  variant={interest === skill ? 'primary' : 'secondary'}
                  onClick={() => setInterest(skill)}
                >
                  {skill}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <Button variant="primary">Find Jobs</Button>
            <Button variant="secondary">Get Training</Button>
            <Button variant="outline">Plan Migration</Button>
          </div>
        </div>
      </Card>

      {/* Jobs Section */}
      <Card elevated className="!p-5">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="h-5 w-5 text-accent-primary" />
          <h2 className="font-semibold text-primary">Jobs in {city}</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job, i) => (
            <div key={i} className="rounded-lg border border-border-light bg-base/40 p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-primary">{job.title}</span>
                <Badge variant="default">{job.city}</Badge>
              </div>
              <span className="text-xs text-secondary">Salary: {job.salary || 'N/A'}</span>
              <Button size="sm" variant="primary" className="mt-2">Apply Now</Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Skill Training Section */}
      <Card elevated className="!p-5">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="h-5 w-5 text-accent-primary" />
          <h2 className="font-semibold text-primary">Skill Training</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filteredTrainings.map((t, i) => (
            <div key={i} className="rounded-lg border border-border-light bg-base/40 p-4 flex flex-col gap-2">
              <span className="font-medium text-primary">{t.name}</span>
              <span className="text-xs text-secondary">Duration: {t.duration}</span>
              <span className="text-xs text-secondary">Location: {t.location}</span>
              <Button size="sm" variant="secondary" className="mt-2">Enroll</Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Migration Guidance Section */}
      <Card elevated className="!p-5">
        <div className="flex items-center gap-2 mb-4">
          <ArrowRight className="h-5 w-5 text-accent-primary" />
          <h2 className="font-semibold text-primary">Migration Guidance</h2>
        </div>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-secondary">
          {MIGRATION_STEPS.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </Card>

      {/* Housing Section */}
      <Card elevated className="!p-5">
        <div className="flex items-center gap-2 mb-4">
          <Home className="h-5 w-5 text-accent-primary" />
          <h2 className="font-semibold text-primary">Affordable Housing</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filteredHousing.map((h, i) => (
            <div key={i} className="rounded-lg border border-border-light bg-base/40 p-4 flex flex-col gap-2">
              <span className="font-medium text-primary">{h.location}</span>
              <span className="text-xs text-secondary">Rent: {h.rent}</span>
              <Button size="sm" variant="outline" className="mt-2">View Details</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
