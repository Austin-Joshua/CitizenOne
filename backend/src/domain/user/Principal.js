const { normalizeRole, policyFor } = require('./RoleBehavior');

/**
 * Authenticated actor in the domain layer (from JWT / session).
 * Encapsulates identity + effective permissions for this request.
 */
class Principal {
  /**
   * @param {{ id: string, role: string }} identity
   */
  constructor(identity) {
    this.id = String(identity.id);
    this.role = normalizeRole(identity.role);
    this._policy = policyFor(this.role);
  }

  /** @param {{ id: string, role: string }} reqUser from Express auth middleware */
  static fromRequestUser(reqUser) {
    return new Principal({ id: reqUser.id, role: reqUser.role });
  }

  get canSubmitServiceRequest() {
    return this._policy.canSubmitServiceRequest;
  }

  get canViewAllServiceRequestsInQueue() {
    return this._policy.canViewAllServiceRequestsInQueue;
  }

  get canSeeRequesterEmailInQueue() {
    return this._policy.canSeeRequesterEmailInQueue;
  }

  get canDecideServiceRequest() {
    return this._policy.canDecideServiceRequest;
  }

  get canViewApplicationQueue() {
    return this._policy.canViewApplicationQueue;
  }

  get canReviewApplications() {
    return this._policy.canReviewApplications;
  }
}

module.exports = { Principal };
