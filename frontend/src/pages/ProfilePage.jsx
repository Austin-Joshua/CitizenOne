import React from 'react';
import PageShell from '../components/layout/PageShell';
import { Card, Button, Badge, Input } from '../components/ui';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <PageShell
      title="Profile"
      description="Your account details and sign-in identifiers."
      actions={
        <Button size="sm" variant="secondary">
          Change password
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
        </Card>
        <Card elevated className="!p-4 space-y-3">
          <Input label="Display name" defaultValue={user?.name || ''} readOnly className="opacity-90" />
          <Input label="Email" type="email" defaultValue={user?.email || ''} readOnly className="opacity-90" />
          <p className="text-[11px] text-tertiary">
            Contact your administrator to update verified identity fields.
          </p>
        </Card>
      </div>
    </PageShell>
  );
};

export default ProfilePage;
