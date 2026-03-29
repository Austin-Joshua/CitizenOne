const { DomainError } = require('../errors/DomainError');

/** Canonical statuses persisted for service requests */
const STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

const ALL_STATUSES = [...Object.values(STATUS)];

/**
 * Valid state transitions for staff/admin decisions.
 * Expanding government workflows (e.g. awaiting citizen) = extend this map only.
 */
const STAFF_TRANSITIONS = {
  [STATUS.DRAFT]: [STATUS.SUBMITTED],
  [STATUS.SUBMITTED]: [STATUS.IN_REVIEW, STATUS.APPROVED, STATUS.REJECTED],
  [STATUS.IN_REVIEW]: [STATUS.APPROVED, STATUS.REJECTED, STATUS.SUBMITTED],
  [STATUS.APPROVED]: [STATUS.IN_REVIEW],
  [STATUS.REJECTED]: [STATUS.SUBMITTED, STATUS.IN_REVIEW],
};

class ServiceRequestWorkflow {
  static get STATUS() {
    return { ...STATUS };
  }

  static assertStaffTransition(fromStatus, toStatus) {
    const from = String(fromStatus || '');
    const to = String(toStatus || '');
    if (from === to) return;
    if (!ALL_STATUSES.includes(to)) {
      throw new DomainError(`Invalid status: ${to}`);
    }
    if (!Object.prototype.hasOwnProperty.call(STAFF_TRANSITIONS, from)) {
      const legacy = ['submitted', 'in_review', 'approved', 'rejected'];
      if (!legacy.includes(to)) {
        throw new DomainError(`Invalid status: ${to}`);
      }
      return;
    }
    const allowed = STAFF_TRANSITIONS[from];
    if (!allowed.includes(to)) {
      throw new DomainError(`Transition not allowed: ${from} → ${to}`);
    }
  }

  /** Citizen creates a new request (not draft in current API — always submitted). */
  static initialStatusForCreate() {
    return STATUS.SUBMITTED;
  }
}

module.exports = { ServiceRequestWorkflow, SERVICE_REQUEST_STATUS: STATUS };
