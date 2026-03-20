import React, { useState } from 'react';
import PageShell from '../components/layout/PageShell';
import { Card, Button, Badge, Input } from '../components/ui';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [largeText, setLargeText] = useState(Boolean(user?.preferences?.largeText));
  const [highContrast, setHighContrast] = useState(Boolean(user?.preferences?.highContrast));
  const [simpleLanguage, setSimpleLanguage] = useState(Boolean(user?.preferences?.simpleLanguage));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState('');

  const saveAll = async () => {
    setSaving(true);
    setSaved('');
    try {
      await updateProfile({
        name,
        preferences: { largeText, highContrast, simpleLanguage },
      });
      setSaved('Saved');
    } catch {
      setSaved('Unable to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell
      title="Profile"
      description="Your account details and sign-in identifiers."
      actions={
        <Button size="sm" variant="secondary" onClick={saveAll} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      }
    >
      <div className="grid gap-3 md:grid-cols-2">
        <Card elevated className="!p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-primary/15 text-sm font-semibold text-accent-primary">
              {(user?.name || 'U').slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-primary">{user?.name || 'User'}</p>
              <p className="truncate text-xs text-secondary">{user?.email}</p>
            </div>
          </div>
          <Badge variant="primary" className="w-fit">
            {user?.role || 'member'}
          </Badge>
          <Badge variant="default" className="w-fit">Plan: {user?.plan || 'free'}</Badge>
        </Card>
        <Card elevated className="!p-4 space-y-3">
          <Input label="Display name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" type="email" defaultValue={user?.email || ''} readOnly className="opacity-90" />
          <p className="text-[11px] text-tertiary">Email is fixed for this demo environment.</p>
          {saved && <p className="text-xs text-secondary">{saved}</p>}
        </Card>
        <Card elevated className="!p-4 space-y-3 md:col-span-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Accessibility & Privacy</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex items-center gap-2 text-sm text-secondary">
              <input type="checkbox" className="h-4 w-4 rounded border-border-light text-accent-primary" checked={largeText} onChange={(e) => setLargeText(e.target.checked)} />
              Large text mode
            </label>
            <label className="flex items-center gap-2 text-sm text-secondary">
              <input type="checkbox" className="h-4 w-4 rounded border-border-light text-accent-primary" checked={highContrast} onChange={(e) => setHighContrast(e.target.checked)} />
              High contrast mode
            </label>
            <label className="flex items-center gap-2 text-sm text-secondary">
              <input type="checkbox" className="h-4 w-4 rounded border-border-light text-accent-primary" checked={simpleLanguage} onChange={(e) => setSimpleLanguage(e.target.checked)} />
              Simple language toggle
            </label>
          </div>
          <div className="rounded-lg border border-border-light bg-base/40 p-3 text-sm text-secondary">
            Session security enabled · activity logs retained for audit and user safety.
          </div>
        </Card>
        <Card elevated className="!p-4 space-y-2 md:col-span-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Recent Activity</p>
          <p className="text-sm text-secondary">• Viewed benefit recommendations · 2h ago</p>
          <p className="text-sm text-secondary">• Updated notification preferences · yesterday</p>
          <p className="text-sm text-secondary">• Opened identity vault · 2 days ago</p>
        </Card>
      </div>
    </PageShell>
  );
};

export default ProfilePage;
