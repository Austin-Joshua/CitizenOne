const { normalizeStateCode } = require('./schemeProfile');

const SOURCE_TYPES = ['official_portal', 'government_compendium', 'policy_brief', 'gazette_notice'];

const AUTHORITATIVE_BUILTIN_SCHEME_IDS = new Set([
  'scheme-pmay-u',
  'scheme-pmjay',
  'scheme-jan-dhan',
  'scheme-atal-pension',
  'scheme-pmsby',
  'scheme-pmjjby',
  'scheme-pm-kisan',
  'scheme-pmfby',
  'scheme-rkvy',
  'scheme-sukanya',
  'scheme-pmmvy',
  'scheme-jsy',
  'scheme-jssk',
  'scheme-nhm',
  'scheme-uip',
  'scheme-mgnrega',
  'scheme-pmkvy',
  'scheme-mudra',
  'scheme-standup-india',
  'scheme-startup-india',
  'scheme-jal-jeevan',
  'scheme-swachh-bharat',
  'scheme-smart-cities',
  'scheme-nfsa',
  'scheme-aay',
  'scheme-digital-india',
  'scheme-bharatnet',
  'scheme-tn-cmchis',
  'scheme-tn-innuyir-kappom',
  'scheme-tn-thalikku-thangam',
  'scheme-tn-anbu-karangal',
  'scheme-tn-gig-workers',
  'scheme-tn-taps',
]);

function slugDocId(label) {
  return String(label || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizeDocumentRequirements(raw) {
  if (Array.isArray(raw.documentRequirements) && raw.documentRequirements.length) {
    return raw.documentRequirements
      .map((d, i) => ({
        id: String(d.id || slugDocId(d.label) || `doc-${i}`),
        label: String(d.label || d.name || ''),
        category: String(d.category || 'General'),
        required: d.required !== false,
      }))
      .filter((d) => d.label);
  }
  const legacy = Array.isArray(raw.requiredDocuments) ? raw.requiredDocuments : [];
  return legacy.map((label, i) => ({
    id: slugDocId(label) || `doc-${i}`,
    label: String(label),
    category: 'General',
    required: true,
  }));
}

function normalizeApplicationWindow(w) {
  if (!w || typeof w !== 'object') return null;
  return {
    type: ['ongoing', 'seasonal', 'annual', 'one_time'].includes(w.type) ? w.type : 'ongoing',
    opensAt: w.opensAt || null,
    closesAt: w.closesAt || null,
    notes: String(w.notes || ''),
  };
}

function normalizeBenefitEstimate(b) {
  if (!b || typeof b !== 'object') return null;
  return {
    amountMin: b.amountMin != null ? Number(b.amountMin) : null,
    amountMax: b.amountMax != null ? Number(b.amountMax) : null,
    currency: String(b.currency || 'INR'),
    unit: String(b.unit || ''),
    narrative: String(b.narrative || ''),
  };
}

function getDefaultSourceAttribution(schemeId) {
  if (AUTHORITATIVE_BUILTIN_SCHEME_IDS.has(schemeId)) {
    return {
      sourceType: 'government_compendium',
      lastVerifiedDate: '2026-03-20',
      policyNotes:
        'Authoritative built-in record curated from official government portals and verified policy compendiums.',
    };
  }
  return {
    sourceType: 'policy_brief',
    lastVerifiedDate: '2026-03-20',
    policyNotes: 'Pending source verification for external import record.',
  };
}

function normalizeScheme(raw) {
  const ec = raw.eligibilityCriteria || {};
  const targetStates = [
    ...(Array.isArray(raw.targetStates) ? raw.targetStates : []),
    ...(Array.isArray(ec.states) ? ec.states : []),
  ]
    .map((s) => normalizeStateCode(s))
    .filter(Boolean);

  const documentRequirements = normalizeDocumentRequirements(raw);
  const requiredDocuments = documentRequirements.map((d) => d.label);

  return {
    id: raw.id || `scheme-${Date.now()}`,
    schemeName: String(raw.schemeName || ''),
    governmentLevel: raw.governmentLevel === 'state' ? 'state' : 'central',
    ministryOrDepartment: String(raw.ministryOrDepartment || ''),
    targetBeneficiaries: Array.isArray(raw.targetBeneficiaries) ? raw.targetBeneficiaries : [],
    targetStates: [...new Set(targetStates)],
    description: String(raw.description || ''),
    benefitsOffered: Array.isArray(raw.benefitsOffered) ? raw.benefitsOffered : [],
    eligibilityCriteria: {
      age: ec.age || {},
      gender: Array.isArray(ec.gender) ? ec.gender : [],
      income: ec.income || {},
      location: Array.isArray(ec.location) ? ec.location : [],
      states: Array.isArray(ec.states) ? ec.states.map((s) => normalizeStateCode(s)) : [],
      districts: Array.isArray(ec.districts) ? ec.districts.map((d) => String(d).toLowerCase().trim()) : [],
      settlementTypes: Array.isArray(ec.settlementTypes) ? ec.settlementTypes.map((x) => String(x).toLowerCase()) : [],
      maritalStatus: Array.isArray(ec.maritalStatus) ? ec.maritalStatus.map((x) => String(x).toLowerCase()) : [],
      education: Array.isArray(ec.education) ? ec.education : [],
      occupation: Array.isArray(ec.occupation) ? ec.occupation : [],
      socialCategory: Array.isArray(ec.socialCategory) ? ec.socialCategory.map((x) => String(x).toLowerCase()) : [],
      specialConditions: Array.isArray(ec.specialConditions) ? ec.specialConditions : [],
    },
    requiredDocuments,
    documentRequirements,
    applicationMode: ['online', 'offline', 'hybrid'].includes(raw.applicationMode) ? raw.applicationMode : 'online',
    officialLink: String(raw.officialLink || ''),
    deadline: raw.deadline || null,
    applicationWindow: normalizeApplicationWindow(raw.applicationWindow),
    renewalCycle: raw.renewalCycle != null ? String(raw.renewalCycle) : '',
    renewalRequirements: String(raw.renewalRequirements || ''),
    whereToApply: String(raw.whereToApply || ''),
    geographicCoverage: Array.isArray(raw.geographicCoverage) ? raw.geographicCoverage : [],
    status: raw.status === 'inactive' ? 'inactive' : 'active',
    sdgGoalMapping: Array.isArray(raw.sdgGoalMapping) ? raw.sdgGoalMapping : [],
    lifeEvents: Array.isArray(raw.lifeEvents) ? raw.lifeEvents : [],
    benefitEstimate: normalizeBenefitEstimate(raw.benefitEstimate),
    supportContacts: Array.isArray(raw.supportContacts)
      ? raw.supportContacts
          .map((c) => ({
            name: String(c.name || ''),
            role: String(c.role || ''),
            phone: String(c.phone || ''),
            email: String(c.email || ''),
            address: String(c.address || ''),
            hours: String(c.hours || ''),
          }))
          .filter((c) => c.name || c.phone || c.email)
      : [],
    sourceAttribution: {
      sourceType: SOURCE_TYPES.includes(raw.sourceAttribution?.sourceType)
        ? raw.sourceAttribution.sourceType
        : getDefaultSourceAttribution(raw.id || '').sourceType,
      lastVerifiedDate: String(
        raw.sourceAttribution?.lastVerifiedDate || getDefaultSourceAttribution(raw.id || '').lastVerifiedDate
      ),
      policyNotes: String(raw.sourceAttribution?.policyNotes || getDefaultSourceAttribution(raw.id || '').policyNotes),
    },
    category: String(raw.category || 'General'),
    estimatedProcessingTimeDays:
      typeof raw.estimatedProcessingTimeDays === 'number' ? raw.estimatedProcessingTimeDays : null,
    guidanceSteps: Array.isArray(raw.guidanceSteps) ? raw.guidanceSteps : [],
  };
}

module.exports = {
  normalizeScheme,
  AUTHORITATIVE_BUILTIN_SCHEME_IDS,
  SOURCE_TYPES,
  getDefaultSourceAttribution,
};
