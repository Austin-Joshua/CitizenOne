const { readCollection } = require('../../lib/dataStore');
const { normalizeStateCode, profileRegionTokens } = require('../../lib/schemeProfile');
const { normalizeScheme, AUTHORITATIVE_BUILTIN_SCHEME_IDS } = require('../../lib/schemeNormalization');

const TNWISE_PRIORITY_SDGS = ['SDG1', 'SDG3', 'SDG4', 'SDG5', 'SDG6', 'SDG8', 'SDG10', 'SDG11'];

function schemeStateTokens(scheme) {
  const fromScheme = [...(scheme.targetStates || []), ...(scheme.eligibilityCriteria?.states || [])].map((s) =>
    normalizeStateCode(s)
  );
  return [...new Set(fromScheme)].filter(Boolean);
}

function matchScore(scheme, profile) {
  let score = 0;
  let checks = 0;
  const c = scheme.eligibilityCriteria || {};
  const settlement = String(profile.settlement || profile.location || '').toLowerCase();

  if (c.age?.min != null || c.age?.max != null) {
    checks += 1;
    const age = profile.age;
    if (typeof age === 'number' && (c.age.min == null || age >= c.age.min) && (c.age.max == null || age <= c.age.max))
      score += 1;
  }
  if (Array.isArray(c.gender) && c.gender.length) {
    checks += 1;
    if (c.gender.includes(profile.gender)) score += 1;
  }
  if (Array.isArray(c.maritalStatus) && c.maritalStatus.length) {
    checks += 1;
    if (c.maritalStatus.includes(String(profile.maritalStatus || '').toLowerCase())) score += 1;
  }
  if (c.income?.max != null) {
    checks += 1;
    if (typeof profile.income === 'number' && profile.income <= c.income.max) score += 1;
  }
  const stateTokens = schemeStateTokens(scheme);
  if (stateTokens.length) {
    checks += 1;
    const pTokens = profileRegionTokens(profile);
    if (pTokens.size && [...pTokens].some((t) => stateTokens.includes(t))) score += 1;
  }
  if (Array.isArray(c.districts) && c.districts.length) {
    checks += 1;
    const d = String(profile.district || '').toLowerCase().trim();
    if (d && c.districts.some((x) => d.includes(x) || x.includes(d))) score += 1;
  }
  if (Array.isArray(c.settlementTypes) && c.settlementTypes.length) {
    checks += 1;
    if (settlement && c.settlementTypes.includes(settlement)) score += 1;
  }
  if (Array.isArray(c.location) && c.location.length) {
    checks += 1;
    const loc = String(profile.location || '').toLowerCase();
    if (loc && c.location.some((x) => loc === String(x).toLowerCase() || String(x).toLowerCase().includes(loc)))
      score += 1;
  }
  if (Array.isArray(c.education) && c.education.length) {
    checks += 1;
    if (c.education.includes(profile.education)) score += 1;
  }
  if (Array.isArray(c.occupation) && c.occupation.length) {
    checks += 1;
    if (c.occupation.includes(profile.occupation)) score += 1;
  }
  if (Array.isArray(c.socialCategory) && c.socialCategory.length) {
    checks += 1;
    if (c.socialCategory.includes(profile.socialCategory)) score += 1;
  }
  if (Array.isArray(c.specialConditions) && c.specialConditions.length) {
    checks += 1;
    const cond = Array.isArray(profile.specialConditions) ? profile.specialConditions : [];
    if (c.specialConditions.some((x) => cond.includes(x))) score += 1;
  }
  return checks ? score / checks : 0;
}

function computeMissingDocuments(scheme, docNames) {
  const reqs = scheme.documentRequirements || [];
  const missingLabels = [];
  const missingDetails = [];
  reqs.forEach((req) => {
    if (!req.required) return;
    const ok = docNames.some(
      (name) =>
        name.includes(String(req.label).toLowerCase()) || (req.id && name.includes(String(req.id).toLowerCase()))
    );
    if (!ok) {
      missingLabels.push(req.label);
      missingDetails.push({ id: req.id, label: req.label, category: req.category });
    }
  });
  return { missingLabels, missingDetails };
}

/**
 * Profile-aware scheme catalogue intelligence (recommendations, eligibility hints, alerts).
 */
class SchemeIntelligenceService {
  constructor(deps = {}) {
    this.readCollection = deps.readCollection || readCollection;
  }

  /**
   * @param {{ userId: string, profile: object, query: Record<string, string | undefined> }} input
   */
  async buildIntelligenceSnapshot(input) {
    const { userId, profile, query } = input;
    const pRegion = profileRegionTokens(profile);
    const userInTamilNadu = pRegion.has('tn') || String(profile.stateCode || '').toUpperCase() === 'TN';

    const [schemesRaw, savesRaw, appsRaw, docsRaw] = await Promise.all([
      this.readCollection('schemes'),
      this.readCollection('schemeSaves'),
      this.readCollection('applications'),
      this.readCollection('documents'),
    ]);

    const allSchemes = schemesRaw.map(normalizeScheme).filter((s) => s.status === 'active');
    const saves = savesRaw.filter((s) => s.userId === userId);
    const apps = appsRaw.filter((a) => a.userId === userId && a.type === 'scheme');

    const q = String(query.search || '').toLowerCase().trim();
    const filters = {
      category: String(query.category || '').trim(),
      beneficiary: String(query.beneficiary || '').trim(),
      location: String(query.location || '').trim(),
      governmentLevel: String(query.governmentLevel || '').trim(),
      sdg: String(query.sdg || '').trim(),
      department: String(query.department || '').trim(),
      lifeEvent: String(query.lifeEvent || '').trim(),
      state: String(query.state || '').trim(),
    };

    const filtered = allSchemes.filter((s) => {
      if (q && !`${s.schemeName} ${s.description} ${s.ministryOrDepartment}`.toLowerCase().includes(q)) return false;
      if (filters.category && s.category.toLowerCase() !== filters.category.toLowerCase()) return false;
      if (
        filters.beneficiary &&
        !s.targetBeneficiaries.some((b) => b.toLowerCase().includes(filters.beneficiary.toLowerCase()))
      )
        return false;
      if (
        filters.location &&
        !s.geographicCoverage.some((g) => g.toLowerCase().includes(filters.location.toLowerCase()))
      )
        return false;
      if (filters.governmentLevel && s.governmentLevel !== filters.governmentLevel) return false;
      if (filters.sdg && !s.sdgGoalMapping.some((sdg) => sdg.toLowerCase() === filters.sdg.toLowerCase())) return false;
      if (filters.department && !s.ministryOrDepartment.toLowerCase().includes(filters.department.toLowerCase()))
        return false;
      if (filters.lifeEvent && !s.lifeEvents.includes(filters.lifeEvent)) return false;
      if (filters.state) {
        const filterTok = new Set(profileRegionTokens({ stateCode: filters.state }));
        filterTok.add(normalizeStateCode(filters.state));
        const st = schemeStateTokens(s);
        if (st.length) {
          const hit = [...filterTok].some((t) => st.includes(t));
          if (!hit) return false;
        }
      }
      return true;
    });

    const userDocuments = docsRaw.filter((d) => d.userId === userId);
    const docNames = userDocuments.map((d) => d.name.toLowerCase());

    const withMatch = filtered.map((scheme) => {
      const score = matchScore(scheme, profile);
      const app = apps.find((a) => a.targetId === scheme.id);
      const save = saves.find((s) => s.schemeId === scheme.id);
      const { missingLabels: missingRequirements, missingDetails: missingDocumentDetails } = computeMissingDocuments(
        scheme,
        docNames
      );
      const pReg = profileRegionTokens(profile);
      const sStates = schemeStateTokens(scheme);
      const regionalBoost =
        scheme.governmentLevel === 'state' && pReg.size && sStates.some((t) => pReg.has(t)) ? 0.06 : 0;
      const tnwiseWeight = scheme.sdgGoalMapping.some((sdg) => TNWISE_PRIORITY_SDGS.includes(sdg)) ? 0.08 : 0;
      const deadlineWeight = scheme.deadline ? 0.04 : 0;
      const windowWeight = scheme.applicationWindow?.type && scheme.applicationWindow.type !== 'ongoing' ? 0.02 : 0;
      const prioritizedScore = Number((score + tnwiseWeight + deadlineWeight + regionalBoost + windowWeight).toFixed(3));
      const authoritativeBuiltIn = AUTHORITATIVE_BUILTIN_SCHEME_IDS.has(scheme.id);
      return {
        ...scheme,
        matchScore: score,
        prioritizedScore,
        isEligible: score >= 0.6,
        isSaved: Boolean(save),
        applicationStatus: app?.status || 'not_started',
        missingRequirements,
        missingDocumentDetails,
        tnwiseAlignedSdgs: scheme.sdgGoalMapping.filter((sdg) => TNWISE_PRIORITY_SDGS.includes(sdg)),
        authoritativeBuiltIn,
      };
    });

    const recommended = [...withMatch].sort((a, b) => b.prioritizedScore - a.prioritizedScore).slice(0, 12);
    const eligible = withMatch.filter((s) => s.isEligible);
    const saved = withMatch.filter((s) => s.isSaved);
    const applied = withMatch.filter((s) => s.applicationStatus !== 'not_started');
    const highImpact = withMatch
      .filter((s) => s.prioritizedScore >= 0.75 || s.sdgGoalMapping.includes('SDG5'))
      .sort((a, b) => b.prioritizedScore - a.prioritizedScore)
      .slice(0, 8);

    const alerts = [
      ...(userInTamilNadu
        ? withMatch
            .filter((s) => s.id.startsWith('scheme-tn-') && s.authoritativeBuiltIn && s.matchScore >= 0.45)
            .sort((a, b) => b.prioritizedScore - a.prioritizedScore)
            .slice(0, 2)
            .map((s) => ({
              type: 'tn_regional',
              schemeId: s.id,
              message: `Tamil Nadu programme to review: ${s.schemeName}`,
            }))
        : []),
      ...withMatch
        .filter((s) => s.isEligible)
        .slice(0, 2)
        .map((s) => ({ type: 'new_eligible', schemeId: s.id, message: `New eligible scheme: ${s.schemeName}` })),
      ...withMatch
        .filter((s) => s.deadline)
        .slice(0, 2)
        .map((s) => ({ type: 'deadline', schemeId: s.id, message: `Deadline approaching for ${s.schemeName}` })),
      ...withMatch
        .filter((s) => s.missingRequirements.length > 0)
        .slice(0, 2)
        .map((s) => ({
          type: 'missing_requirements',
          schemeId: s.id,
          message: `Missing documents for ${s.schemeName}: ${s.missingRequirements.slice(0, 2).join(', ')}`,
        })),
    ];

    return {
      profile,
      filters,
      totals: {
        all: withMatch.length,
        eligible: eligible.length,
        recommended: recommended.length,
        saved: saved.length,
        applied: applied.length,
        highImpact: highImpact.length,
      },
      source: {
        mode: 'authoritative_builtin',
        dataset: 'india-national-and-tamil-nadu-state-v1',
      },
      recommended,
      eligible,
      saved,
      applied,
      highImpact,
      alerts,
    };
  }
}

let singleton;
function getSchemeIntelligenceService() {
  if (!singleton) singleton = new SchemeIntelligenceService();
  return singleton;
}

module.exports = {
  SchemeIntelligenceService,
  getSchemeIntelligenceService,
  schemeStateTokens,
  matchScore,
  computeMissingDocuments,
  TNWISE_PRIORITY_SDGS,
};
