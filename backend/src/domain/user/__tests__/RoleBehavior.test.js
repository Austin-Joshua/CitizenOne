const {
  normalizeRole,
  policyFor,
  portalMatchesAccount,
  isEndUserRole,
  canViewAllServiceRequests,
  canDecideServiceRequests,
  canReviewApplications,
  canViewApplicationQueue,
} = require('../RoleBehavior');

describe('RoleBehavior', () => {
  describe('normalizeRole', () => {
    it('defaults empty to citizen', () => {
      expect(normalizeRole('')).toBe('citizen');
      expect(normalizeRole(null)).toBe('citizen');
    });

    it('maps legacy staff aliases to staff', () => {
      expect(normalizeRole('service_provider')).toBe('staff');
      expect(normalizeRole('officer')).toBe('staff');
    });

    it('lowercases known roles', () => {
      expect(normalizeRole('Admin')).toBe('admin');
    });
  });

  describe('policyFor', () => {
    it('returns staff policy for normalized legacy alias', () => {
      const p = policyFor('officer');
      expect(p.canDecideServiceRequest).toBe(true);
      expect(p.canViewAllServiceRequestsInQueue).toBe(true);
    });

    it('falls back to citizen for unknown role', () => {
      const p = policyFor('ninja');
      expect(p).toEqual(policyFor('citizen'));
    });

    it('organization can queue-view but not decide service requests', () => {
      const p = policyFor('organization');
      expect(p.canViewAllServiceRequestsInQueue).toBe(true);
      expect(p.canDecideServiceRequest).toBe(false);
      expect(p.canReviewApplications).toBe(false);
    });
  });

  describe('portalMatchesAccount', () => {
    it('returns true for empty portal', () => {
      expect(portalMatchesAccount('', 'citizen')).toBe(true);
    });

    it('maps resident portal to citizen and student', () => {
      expect(portalMatchesAccount('resident', 'citizen')).toBe(true);
      expect(portalMatchesAccount('resident', 'student')).toBe(true);
      expect(portalMatchesAccount('resident', 'staff')).toBe(false);
    });

    it('maps staff and admin portals', () => {
      expect(portalMatchesAccount('staff', 'staff')).toBe(true);
      expect(portalMatchesAccount('administrator', 'admin')).toBe(true);
      expect(portalMatchesAccount('organization', 'organization')).toBe(true);
    });

    it('returns false for mismatched portal', () => {
      expect(portalMatchesAccount('staff', 'citizen')).toBe(false);
    });
  });

  describe('permission helpers', () => {
    it('isEndUserRole', () => {
      expect(isEndUserRole('student')).toBe(true);
      expect(isEndUserRole('staff')).toBe(false);
    });

    it('aggregates policy flags', () => {
      expect(canViewAllServiceRequests('admin')).toBe(true);
      expect(canDecideServiceRequests('citizen')).toBe(false);
      expect(canReviewApplications('staff')).toBe(true);
      expect(canViewApplicationQueue('organization')).toBe(true);
    });
  });
});
