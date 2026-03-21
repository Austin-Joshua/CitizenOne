const { GovernmentScheme } = require('./GovernmentScheme');

/**
 * Encapsulates eligibility evaluation against a resident profile.
 * Heavy scoring stays in routes/schemes intelligence until migrated; this class is the seam.
 */
class EligibilityEvaluator {
  /**
   * @param {Record<string, unknown>} schemeDto
   * @param {Record<string, unknown>} profile schemeProfile / merged profile
   * @returns {{ likelyEligible: boolean, score: number, notes: string[] }}
   */
  static evaluate(schemeDto, profile) {
    const scheme = schemeDto instanceof GovernmentScheme ? schemeDto : new GovernmentScheme(schemeDto);
    const notes = [];
    let score = 0.5;

    const rules = scheme.eligibilityRules;
    if (rules && typeof rules === 'object') {
      if (rules.minAge != null && profile?.age != null) {
        const age = Number(profile.age);
        if (!Number.isNaN(age) && age < Number(rules.minAge)) {
          notes.push('Below minimum age in scheme rules');
          score -= 0.2;
        }
      }
      if (rules.stateCodes?.length && profile?.stateCode) {
        const ok = rules.stateCodes.map(String).includes(String(profile.stateCode).toUpperCase());
        if (!ok) {
          notes.push('State/region may not match scheme coverage');
          score -= 0.15;
        }
      }
    }

    score = Math.max(0, Math.min(1, score));
    return {
      likelyEligible: score >= 0.35,
      score,
      notes,
    };
  }
}

module.exports = { EligibilityEvaluator };
