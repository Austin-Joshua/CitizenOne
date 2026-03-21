/**
 * Domain wrapper for a government programme / scheme record.
 * Keeps transport DTOs separate from optional behaviour (eligibility, guidance).
 */
class GovernmentScheme {
  /**
   * @param {Record<string, unknown>} dto raw row from persistence or import pipeline
   */
  constructor(dto) {
    if (!dto || typeof dto !== 'object') {
      throw new TypeError('GovernmentScheme requires a data object');
    }
    this._dto = { ...dto };
  }

  get id() {
    return this._dto.id;
  }

  get schemeName() {
    return this._dto.schemeName || this._dto.name || '';
  }

  get governmentLevel() {
    return this._dto.governmentLevel || 'central';
  }

  get sdgTags() {
    return Array.isArray(this._dto.tnwiseAlignedSdgs) ? this._dto.tnwiseAlignedSdgs : [];
  }

  get documentRequirements() {
    return Array.isArray(this._dto.documentRequirements) ? this._dto.documentRequirements : [];
  }

  get eligibilityRules() {
    return this._dto.eligibilityRules && typeof this._dto.eligibilityRules === 'object'
      ? this._dto.eligibilityRules
      : null;
  }

  /** Plain object for API responses */
  toJSON() {
    return { ...this._dto };
  }
}

module.exports = { GovernmentScheme };
