const { DomainError } = require('../../errors/DomainError');
const { ProgramApplicationWorkflow, APPLICATION_STATUS } = require('../ProgramApplicationWorkflow');

describe('ProgramApplicationWorkflow', () => {
  describe('assertReviewTransition', () => {
    it('allows same status as no-op', () => {
      expect(() => ProgramApplicationWorkflow.assertReviewTransition('under_review', 'under_review')).not.toThrow();
    });

    it('allows submitted → under_review', () => {
      expect(() =>
        ProgramApplicationWorkflow.assertReviewTransition(
          APPLICATION_STATUS.SUBMITTED,
          APPLICATION_STATUS.UNDER_REVIEW
        )
      ).not.toThrow();
    });

    it('rejects invalid target status', () => {
      expect(() => ProgramApplicationWorkflow.assertReviewTransition('submitted', 'bogus')).toThrow(DomainError);
    });

    it('rejects disallowed review transition', () => {
      expect(() =>
        ProgramApplicationWorkflow.assertReviewTransition(APPLICATION_STATUS.APPROVED, APPLICATION_STATUS.SUBMITTED)
      ).toThrow(/Review transition not allowed/);
    });

    it('is permissive when from is unknown (not in transition map)', () => {
      expect(() =>
        ProgramApplicationWorkflow.assertReviewTransition('legacy_unknown', APPLICATION_STATUS.UNDER_REVIEW)
      ).not.toThrow();
    });
  });

  describe('assertOwnerPatch', () => {
    it('allows draft and review lifecycle states', () => {
      expect(() => ProgramApplicationWorkflow.assertOwnerPatch(APPLICATION_STATUS.DRAFT)).not.toThrow();
      expect(() => ProgramApplicationWorkflow.assertOwnerPatch(APPLICATION_STATUS.SUBMITTED)).not.toThrow();
    });

    it('rejects unknown status', () => {
      expect(() => ProgramApplicationWorkflow.assertOwnerPatch('bogus')).toThrow(DomainError);
    });
  });
});
