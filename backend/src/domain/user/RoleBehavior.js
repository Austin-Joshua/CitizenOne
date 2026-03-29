/**
 * Role policies: permissions for government-style roles.
 * Legacy aliases (service_provider, officer) normalize to staff.
 */

const LEGACY_STAFF_ALIASES = new Set(['service_provider', 'officer']);

function normalizeRole(role) {
  const r = String(role || 'citizen').toLowerCase();
  if (LEGACY_STAFF_ALIASES.has(r)) return 'staff';
  return r;
}

/** @typedef {{ canSubmitServiceRequest: boolean, canViewAllServiceRequestsInQueue: boolean, canSeeRequesterEmailInQueue: boolean, canDecideServiceRequest: boolean, canViewApplicationQueue: boolean, canReviewApplications: boolean }} RolePolicy */

/** @type {Record<string, RolePolicy>} */
const POLICIES = {
  citizen: {
    canSubmitServiceRequest: true,
    canViewAllServiceRequestsInQueue: false,
    canSeeRequesterEmailInQueue: false,
    canDecideServiceRequest: false,
    canViewApplicationQueue: false,
    canReviewApplications: false,
  },
  student: {
    canSubmitServiceRequest: true,
    canViewAllServiceRequestsInQueue: false,
    canSeeRequesterEmailInQueue: false,
    canDecideServiceRequest: false,
    canViewApplicationQueue: false,
    canReviewApplications: false,
  },
  staff: {
    canSubmitServiceRequest: false,
    canViewAllServiceRequestsInQueue: true,
    canSeeRequesterEmailInQueue: true,
    canDecideServiceRequest: true,
    canViewApplicationQueue: true,
    canReviewApplications: true,
  },
  organization: {
    canSubmitServiceRequest: false,
    canViewAllServiceRequestsInQueue: true,
    canSeeRequesterEmailInQueue: false,
    canDecideServiceRequest: false,
    canViewApplicationQueue: true,
    canReviewApplications: false,
  },
  admin: {
    canSubmitServiceRequest: false,
    canViewAllServiceRequestsInQueue: true,
    canSeeRequesterEmailInQueue: true,
    canDecideServiceRequest: true,
    canViewApplicationQueue: true,
    canReviewApplications: true,
  },
};

function policyFor(role) {
  const n = normalizeRole(role);
  return POLICIES[n] || POLICIES.citizen;
}

function portalMatchesAccount(portalKey, userRole) {
  const r = normalizeRole(userRole);
  const portal = String(portalKey || '').toLowerCase();
  if (!portal) return true;
  if (portal === 'resident') return r === 'citizen' || r === 'student';
  if (portal === 'staff') return r === 'staff';
  if (portal === 'organization') return r === 'organization';
  if (portal === 'administrator') return r === 'admin';
  return false;
}

/** Backward-compatible function exports for existing call sites */
function isEndUserRole(role) {
  const r = normalizeRole(role);
  return r === 'citizen' || r === 'student';
}

function canViewAllServiceRequests(role) {
  return policyFor(role).canViewAllServiceRequestsInQueue;
}

function canDecideServiceRequests(role) {
  return policyFor(role).canDecideServiceRequest;
}

function canReviewApplications(role) {
  return policyFor(role).canReviewApplications;
}

function canViewApplicationQueue(role) {
  return policyFor(role).canViewApplicationQueue;
}

module.exports = {
  normalizeRole,
  policyFor,
  portalMatchesAccount,
  isEndUserRole,
  canViewAllServiceRequests,
  canDecideServiceRequests,
  canReviewApplications,
  canViewApplicationQueue,
};
