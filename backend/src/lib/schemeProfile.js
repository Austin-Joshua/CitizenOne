const DEFAULT_SCHEME_PROFILE = {
  age: null,
  gender: '',
  maritalStatus: '',
  income: null,
  occupation: '',
  education: '',
  stateCode: '',
  district: '',
  settlement: '',
  socialCategory: '',
  familyHouseholdSize: null,
  dependentsUnder18: null,
  specialConditions: [],
  location: '',
};

function normalizeStateCode(code) {
  return String(code || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
}

function profileRegionTokens(profile) {
  const raw = normalizeStateCode(profile.stateCode);
  const tokens = new Set();
  if (raw) tokens.add(raw);
  if (raw === 'tn') {
    tokens.add('tamil_nadu');
    tokens.add('tamilnadu');
  }
  if (raw === 'tamil_nadu' || raw === 'tamilnadu') tokens.add('tn');
  return tokens;
}

function mergeSchemeProfile(existing, patch) {
  const base = { ...DEFAULT_SCHEME_PROFILE, ...(existing && typeof existing === 'object' ? existing : {}) };
  const p = patch && typeof patch === 'object' ? patch : {};
  const next = { ...base };

  if (p.age != null) next.age = p.age === '' ? null : Number(p.age);
  if (p.gender != null) next.gender = String(p.gender || '').trim();
  if (p.maritalStatus != null) next.maritalStatus = String(p.maritalStatus || '').trim();
  if (p.income != null) next.income = p.income === '' ? null : Number(p.income);
  if (p.occupation != null) next.occupation = String(p.occupation || '').trim();
  if (p.education != null) next.education = String(p.education || '').trim();
  if (p.stateCode != null) next.stateCode = String(p.stateCode || '').trim();
  if (p.district != null) next.district = String(p.district || '').trim();
  if (p.settlement != null) next.settlement = String(p.settlement || '').trim().toLowerCase();
  if (p.socialCategory != null) next.socialCategory = String(p.socialCategory || '').trim().toLowerCase();
  if (p.familyHouseholdSize != null) next.familyHouseholdSize = p.familyHouseholdSize === '' ? null : Number(p.familyHouseholdSize);
  if (p.dependentsUnder18 != null) next.dependentsUnder18 = p.dependentsUnder18 === '' ? null : Number(p.dependentsUnder18);
  if (Array.isArray(p.specialConditions)) next.specialConditions = p.specialConditions.map((x) => String(x).trim()).filter(Boolean);
  if (p.location != null) next.location = String(p.location || '').trim().toLowerCase();

  if (next.settlement && !next.location) {
    next.location = next.settlement;
  }

  return next;
}

module.exports = {
  DEFAULT_SCHEME_PROFILE,
  mergeSchemeProfile,
  normalizeStateCode,
  profileRegionTokens,
};
