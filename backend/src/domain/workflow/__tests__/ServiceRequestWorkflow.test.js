const { DomainError } = require('../../errors/DomainError');
const { ServiceRequestWorkflow, SERVICE_REQUEST_STATUS } = require('../ServiceRequestWorkflow');

describe('ServiceRequestWorkflow', () => {
  describe('assertStaffTransition', () => {
    it('allows same status as no-op', () => {
      expect(() => ServiceRequestWorkflow.assertStaffTransition('submitted', 'submitted')).not.toThrow();
    });

    it('allows submitted → in_review', () => {
      expect(() =>
        ServiceRequestWorkflow.assertStaffTransition(SERVICE_REQUEST_STATUS.SUBMITTED, SERVICE_REQUEST_STATUS.IN_REVIEW)
      ).not.toThrow();
    });

    it('rejects invalid target status', () => {
      expect(() => ServiceRequestWorkflow.assertStaffTransition('submitted', 'bogus')).toThrow(DomainError);
      expect(() => ServiceRequestWorkflow.assertStaffTransition('submitted', 'bogus')).toThrow(/Invalid status/);
    });

    it('rejects disallowed transition', () => {
      expect(() =>
        ServiceRequestWorkflow.assertStaffTransition(SERVICE_REQUEST_STATUS.APPROVED, SERVICE_REQUEST_STATUS.REJECTED)
      ).toThrow(DomainError);
      expect(() =>
        ServiceRequestWorkflow.assertStaffTransition(SERVICE_REQUEST_STATUS.APPROVED, SERVICE_REQUEST_STATUS.REJECTED)
      ).toThrow(/Transition not allowed/);
    });

    it('permits legacy unknown from with canonical staff targets only', () => {
      expect(() => ServiceRequestWorkflow.assertStaffTransition('unknown_legacy', 'submitted')).not.toThrow();
      expect(() => ServiceRequestWorkflow.assertStaffTransition('unknown_legacy', 'draft')).toThrow(DomainError);
    });
  });

  describe('initialStatusForCreate', () => {
    it('returns submitted', () => {
      expect(ServiceRequestWorkflow.initialStatusForCreate()).toBe(SERVICE_REQUEST_STATUS.SUBMITTED);
    });
  });
});
