import React, { useState } from 'react';
import PageShell from '../components/layout/PageShell';
import { Card, Badge, Button } from '../components/ui';
import { useAuth } from '../context/AuthContext';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    features: ['Core dashboard', 'Basic scheme discovery', 'Standard alerts'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$29',
    features: ['AI assistant copilots', 'Predictive insights', 'Priority support', 'Org-level controls'],
  },
];

const BillingPage = () => {
  const { user, updateProfile } = useAuth();
  const [plan, setPlan] = useState(user?.plan || 'free');
  const [saving, setSaving] = useState(false);
  const billingHistory = [
    { id: 'INV-2026-001', period: 'Jan 2026', amount: '$29', status: 'Paid' },
    { id: 'INV-2026-002', period: 'Feb 2026', amount: '$29', status: 'Paid' },
    { id: 'INV-2026-003', period: 'Mar 2026', amount: '$29', status: 'Pending' },
  ];

  return (
    <PageShell
      title="Subscription Management"
      description="Manage SaaS plan access, billing tier, and enterprise feature availability."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {plans.map((p) => (
          <Card key={p.id} elevated className="!p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{p.name}</h3>
              {plan === p.id && <Badge variant="primary">Current Plan</Badge>}
            </div>
            <p className="mt-1 text-3xl font-semibold">{p.price}<span className="text-sm text-secondary">/month</span></p>
            <ul className="mt-3 space-y-2 text-sm text-secondary">
              {p.features.map((f) => <li key={f}>• {f}</li>)}
            </ul>
            <Button
              className="mt-5"
              variant={plan === p.id ? 'secondary' : 'primary'}
              onClick={async () => {
                setSaving(true);
                try {
                  await updateProfile({ plan: p.id });
                  setPlan(p.id);
                } finally {
                  setSaving(false);
                }
              }}
              disabled={saving}
            >
              {saving ? 'Updating...' : plan === p.id ? 'Selected' : p.id === 'premium' ? 'Upgrade' : 'Downgrade'}
            </Button>
          </Card>
        ))}
      </div>
      <Card elevated className="!p-5">
        <h3 className="text-lg font-semibold">Billing History</h3>
        <div className="mt-3 overflow-hidden rounded-lg border border-border-light">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface/60 text-secondary">
              <tr>
                <th className="px-3 py-2 font-medium">Invoice</th>
                <th className="px-3 py-2 font-medium">Period</th>
                <th className="px-3 py-2 font-medium">Amount</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {billingHistory.map((invoice) => (
                <tr key={invoice.id} className="border-t border-border-light text-primary">
                  <td className="px-3 py-2">{invoice.id}</td>
                  <td className="px-3 py-2">{invoice.period}</td>
                  <td className="px-3 py-2">{invoice.amount}</td>
                  <td className="px-3 py-2">
                    <Badge variant={invoice.status === 'Paid' ? 'primary' : 'warning'}>{invoice.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageShell>
  );
};

export default BillingPage;
