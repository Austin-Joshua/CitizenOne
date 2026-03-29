const { DomainError } = require('../errors/DomainError');

const STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  IN_PROGRESS: 'in_progress',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
};

const REVIEW_ALLOWED = ['submitted', 'in_progress', 'under_review', 'approved', 'rejected', 'completed'];

const STAFF_REVIEW_TRANSITIONS = {
  [STATUS.SUBMITTED]: [
    STATUS.IN_PROGRESS,
    STATUS.UNDER_REVIEW,
    STATUS.APPROVED,
    STATUS.REJECTED,
    STATUS.COMPLETED,
  ],
  [STATUS.IN_PROGRESS]: [
    STATUS.UNDER_REVIEW,
    STATUS.APPROVED,
    STATUS.REJECTED,
    STATUS.COMPLETED,
    STATUS.SUBMITTED,
  ],
  [STATUS.UNDER_REVIEW]: [
    STATUS.APPROVED,
    STATUS.REJECTED,
    STATUS.IN_PROGRESS,
    STATUS.COMPLETED,
  ],
  [STATUS.APPROVED]: [],
  [STATUS.REJECTED]: [],
  [STATUS.COMPLETED]: [],
  [STATUS.DRAFT]: [STATUS.SUBMITTED],
};

class ProgramApplicationWorkflow {
  static get STATUS() {
    return { ...STATUS };
  }

  static assertReviewTransition(fromStatus, toStatus) {
    const from = String(fromStatus || '');
    const to = String(toStatus || '');
    if (from === to) return;
    if (!REVIEW_ALLOWED.includes(to)) {
      throw new DomainError(`Invalid application status: ${to}`);
    }
    if (!Object.prototype.hasOwnProperty.call(STAFF_REVIEW_TRANSITIONS, from)) {
      return;
    }
    const allowed = STAFF_REVIEW_TRANSITIONS[from];
    if (!allowed.includes(to)) {
      throw new DomainError(`Review transition not allowed: ${from} → ${to}`);
    }
  }

  /** Owner may update their own row; keep to known lifecycle states */
  static assertOwnerPatch(toStatus) {
    const to = String(toStatus || '');
    if (!REVIEW_ALLOWED.includes(to) && to !== STATUS.DRAFT) {
      throw new DomainError(`Invalid status: ${to}`);
    }
  }

  static initialStatusForSubmit() {
    return STATUS.SUBMITTED;
  }
}

module.exports = { ProgramApplicationWorkflow, APPLICATION_STATUS: STATUS };
