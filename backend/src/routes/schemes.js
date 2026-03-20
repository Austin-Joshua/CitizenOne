const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { readCollection, writeCollection, nextId } = require('../lib/dataStore');
const { findUserById } = require('../lib/userStore');

const TRACKING_STATES = ['not_started', 'in_progress', 'submitted', 'under_review', 'approved', 'rejected'];
const TNWISE_PRIORITY_SDGS = ['SDG1', 'SDG3', 'SDG4', 'SDG5', 'SDG6', 'SDG8', 'SDG10', 'SDG11'];
const AUTHORITATIVE_BUILTIN_SCHEME_IDS = new Set([
  'scheme-pmay-u',
  'scheme-pmjay',
  'scheme-jan-dhan',
  'scheme-atal-pension',
  'scheme-pmsby',
  'scheme-pm-kisan',
  'scheme-pmfby',
  'scheme-sukanya',
  'scheme-pmmvy',
  'scheme-mgnrega',
  'scheme-pmkvy',
  'scheme-mudra',
  'scheme-standup-india',
  'scheme-jal-jeevan',
  'scheme-swachh-bharat',
]);
const SOURCE_TYPES = ['official_portal', 'government_compendium', 'policy_brief', 'gazette_notice'];

const SCHEME_SCHEMA = {
  id: 'string',
  schemeName: 'string',
  governmentLevel: 'central|state',
  ministryOrDepartment: 'string',
  targetBeneficiaries: 'string[]',
  description: 'string',
  benefitsOffered: 'string[]',
  eligibilityCriteria: {
    age: { min: 'number?', max: 'number?' },
    gender: 'string[]',
    income: { max: 'number?' },
    location: 'string[]',
    education: 'string[]',
    occupation: 'string[]',
    socialCategory: 'string[]',
    specialConditions: 'string[]',
  },
  requiredDocuments: 'string[]',
  applicationMode: 'online|offline|hybrid',
  officialLink: 'string',
  deadline: 'string (ISO date)',
  geographicCoverage: 'string[]',
  status: 'active|inactive',
  sdgGoalMapping: 'string[]',
  lifeEvents: 'string[]',
  sourceAttribution: {
    sourceType: 'official_portal|government_compendium|policy_brief|gazette_notice',
    lastVerifiedDate: 'string (ISO date)',
    policyNotes: 'string',
  },
  category: 'string',
  estimatedProcessingTimeDays: 'number?',
  guidanceSteps: 'string[]',
};

function getDefaultSourceAttribution(schemeId) {
  if (AUTHORITATIVE_BUILTIN_SCHEME_IDS.has(schemeId)) {
    return {
      sourceType: 'government_compendium',
      lastVerifiedDate: '2026-03-20',
      policyNotes: 'Authoritative built-in record curated from official government portals and verified policy compendiums.',
    };
  }
  return {
    sourceType: 'policy_brief',
    lastVerifiedDate: '2026-03-20',
    policyNotes: 'Pending source verification for external import record.',
  };
}

function normalizeScheme(raw) {
  return {
    id: raw.id || `scheme-${Date.now()}`,
    schemeName: String(raw.schemeName || ''),
    governmentLevel: raw.governmentLevel === 'state' ? 'state' : 'central',
    ministryOrDepartment: String(raw.ministryOrDepartment || ''),
    targetBeneficiaries: Array.isArray(raw.targetBeneficiaries) ? raw.targetBeneficiaries : [],
    description: String(raw.description || ''),
    benefitsOffered: Array.isArray(raw.benefitsOffered) ? raw.benefitsOffered : [],
    eligibilityCriteria: {
      age: raw.eligibilityCriteria?.age || {},
      gender: Array.isArray(raw.eligibilityCriteria?.gender) ? raw.eligibilityCriteria.gender : [],
      income: raw.eligibilityCriteria?.income || {},
      location: Array.isArray(raw.eligibilityCriteria?.location) ? raw.eligibilityCriteria.location : [],
      education: Array.isArray(raw.eligibilityCriteria?.education) ? raw.eligibilityCriteria.education : [],
      occupation: Array.isArray(raw.eligibilityCriteria?.occupation) ? raw.eligibilityCriteria.occupation : [],
      socialCategory: Array.isArray(raw.eligibilityCriteria?.socialCategory) ? raw.eligibilityCriteria.socialCategory : [],
      specialConditions: Array.isArray(raw.eligibilityCriteria?.specialConditions) ? raw.eligibilityCriteria.specialConditions : [],
    },
    requiredDocuments: Array.isArray(raw.requiredDocuments) ? raw.requiredDocuments : [],
    applicationMode: ['online', 'offline', 'hybrid'].includes(raw.applicationMode) ? raw.applicationMode : 'online',
    officialLink: String(raw.officialLink || ''),
    deadline: raw.deadline || null,
    geographicCoverage: Array.isArray(raw.geographicCoverage) ? raw.geographicCoverage : [],
    status: raw.status === 'inactive' ? 'inactive' : 'active',
    sdgGoalMapping: Array.isArray(raw.sdgGoalMapping) ? raw.sdgGoalMapping : [],
    lifeEvents: Array.isArray(raw.lifeEvents) ? raw.lifeEvents : [],
    sourceAttribution: {
      sourceType: SOURCE_TYPES.includes(raw.sourceAttribution?.sourceType)
        ? raw.sourceAttribution.sourceType
        : getDefaultSourceAttribution(raw.id || '').sourceType,
      lastVerifiedDate: String(raw.sourceAttribution?.lastVerifiedDate || getDefaultSourceAttribution(raw.id || '').lastVerifiedDate),
      policyNotes: String(raw.sourceAttribution?.policyNotes || getDefaultSourceAttribution(raw.id || '').policyNotes),
    },
    category: String(raw.category || 'General'),
    estimatedProcessingTimeDays: typeof raw.estimatedProcessingTimeDays === 'number' ? raw.estimatedProcessingTimeDays : null,
    guidanceSteps: Array.isArray(raw.guidanceSteps) ? raw.guidanceSteps : [],
  };
}

function validateSchemeRow(raw, rowIndex) {
  const errors = [];
  const row = raw || {};
  const has = (value) => value != null && String(value).trim() !== '';

  if (!has(row.id)) errors.push('id is required');
  if (!has(row.schemeName)) errors.push('schemeName is required');
  if (!has(row.ministryOrDepartment)) errors.push('ministryOrDepartment is required');
  if (!has(row.description)) errors.push('description is required');
  if (!has(row.category)) errors.push('category is required');
  if (!has(row.officialLink)) errors.push('officialLink is required');
  if (!['central', 'state'].includes(row.governmentLevel)) errors.push('governmentLevel must be central or state');
  if (!['online', 'offline', 'hybrid'].includes(row.applicationMode)) errors.push('applicationMode must be online, offline, or hybrid');
  if (!Array.isArray(row.targetBeneficiaries)) errors.push('targetBeneficiaries must be an array');
  if (!Array.isArray(row.benefitsOffered)) errors.push('benefitsOffered must be an array');
  if (!Array.isArray(row.requiredDocuments)) errors.push('requiredDocuments must be an array');
  if (!Array.isArray(row.geographicCoverage)) errors.push('geographicCoverage must be an array');
  if (!Array.isArray(row.sdgGoalMapping)) errors.push('sdgGoalMapping must be an array');
  if (!Array.isArray(row.guidanceSteps)) errors.push('guidanceSteps must be an array');

  if (has(row.officialLink)) {
    try {
      const url = new URL(String(row.officialLink));
      if (!['http:', 'https:'].includes(url.protocol)) errors.push('officialLink must be http or https');
    } catch {
      errors.push('officialLink must be a valid URL');
    }
  }

  if (row.deadline != null && String(row.deadline).trim() !== '' && Number.isNaN(Date.parse(String(row.deadline)))) {
    errors.push('deadline must be an ISO date when provided');
  }

  const source = row.sourceAttribution || {};
  if (!source || typeof source !== 'object') {
    errors.push('sourceAttribution is required');
  } else {
    if (!SOURCE_TYPES.includes(source.sourceType)) {
      errors.push(`sourceAttribution.sourceType must be one of: ${SOURCE_TYPES.join(', ')}`);
    }
    if (!has(source.lastVerifiedDate) || Number.isNaN(Date.parse(String(source.lastVerifiedDate)))) {
      errors.push('sourceAttribution.lastVerifiedDate must be a valid date');
    }
    if (!has(source.policyNotes) || String(source.policyNotes).length < 12) {
      errors.push('sourceAttribution.policyNotes must be at least 12 characters');
    }
  }

  if (!row.eligibilityCriteria || typeof row.eligibilityCriteria !== 'object') {
    errors.push('eligibilityCriteria object is required');
  }

  return {
    row: rowIndex + 1,
    id: String(row.id || ''),
    schemeName: String(row.schemeName || ''),
    errors,
  };
}

function hasImportAccess(user) {
  return user?.role === 'admin' || user?.role === 'organization';
}

function escapeCsvCell(value) {
  const text = String(value ?? '');
  if (text.includes('"') || text.includes(',') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function buildCsvErrorReport(rowErrors, duplicateIds) {
  const header = ['row', 'id', 'schemeName', 'errorCount', 'errors'];
  const rows = rowErrors.map((item) => [
    item.row,
    item.id,
    item.schemeName,
    item.errors.length,
    item.errors.join(' | '),
  ]);

  const duplicateRows = (duplicateIds || []).map((id) => [
    '',
    id,
    '',
    1,
    'Duplicate scheme id detected in import payload',
  ]);

  return [header, ...rows, ...duplicateRows].map((row) => row.map(escapeCsvCell).join(',')).join('\n');
}

function validationSummary(incoming, rowErrors, duplicateIds) {
  return {
    valid: rowErrors.length === 0 && duplicateIds.length === 0,
    totals: {
      rows: incoming.length,
      rowsWithErrors: rowErrors.length,
      duplicateIds: duplicateIds.length,
    },
    duplicateIds: [...new Set(duplicateIds)],
    rowErrors,
  };
}

function matchScore(scheme, profile) {
  let score = 0;
  let checks = 0;
  const c = scheme.eligibilityCriteria || {};

  if (c.age?.min != null || c.age?.max != null) {
    checks += 1;
    const age = profile.age;
    if (typeof age === 'number' && (c.age.min == null || age >= c.age.min) && (c.age.max == null || age <= c.age.max)) score += 1;
  }
  if (Array.isArray(c.gender) && c.gender.length) {
    checks += 1;
    if (c.gender.includes(profile.gender)) score += 1;
  }
  if (c.income?.max != null) {
    checks += 1;
    if (typeof profile.income === 'number' && profile.income <= c.income.max) score += 1;
  }
  if (Array.isArray(c.location) && c.location.length) {
    checks += 1;
    if (c.location.includes(profile.location)) score += 1;
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

router.get('/schema', auth, (req, res) => {
  res.json({ schema: SCHEME_SCHEMA, trackingStates: TRACKING_STATES });
});

router.get('/', auth, (req, res) => {
  const rows = readCollection('schemes').map(normalizeScheme);
  res.json(rows);
});

router.get('/intelligence', auth, (req, res) => {
  const user = findUserById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const profile = user.schemeProfile || {};
  const allSchemes = readCollection('schemes').map(normalizeScheme).filter((s) => s.status === 'active');
  const saves = readCollection('schemeSaves').filter((s) => s.userId === req.user.id);
  const apps = readCollection('applications').filter((a) => a.userId === req.user.id && a.type === 'scheme');
  const q = String(req.query.search || '').toLowerCase().trim();
  const filters = {
    category: String(req.query.category || '').trim(),
    beneficiary: String(req.query.beneficiary || '').trim(),
    location: String(req.query.location || '').trim(),
    governmentLevel: String(req.query.governmentLevel || '').trim(),
    sdg: String(req.query.sdg || '').trim(),
    department: String(req.query.department || '').trim(),
    lifeEvent: String(req.query.lifeEvent || '').trim(),
  };

  const filtered = allSchemes.filter((s) => {
    if (q && !`${s.schemeName} ${s.description} ${s.ministryOrDepartment}`.toLowerCase().includes(q)) return false;
    if (filters.category && s.category.toLowerCase() !== filters.category.toLowerCase()) return false;
    if (filters.beneficiary && !s.targetBeneficiaries.some((b) => b.toLowerCase().includes(filters.beneficiary.toLowerCase()))) return false;
    if (filters.location && !s.geographicCoverage.some((g) => g.toLowerCase().includes(filters.location.toLowerCase()))) return false;
    if (filters.governmentLevel && s.governmentLevel !== filters.governmentLevel) return false;
    if (filters.sdg && !s.sdgGoalMapping.some((sdg) => sdg.toLowerCase() === filters.sdg.toLowerCase())) return false;
    if (filters.department && !s.ministryOrDepartment.toLowerCase().includes(filters.department.toLowerCase())) return false;
    if (filters.lifeEvent && !s.lifeEvents.includes(filters.lifeEvent)) return false;
    return true;
  });

  const userDocuments = readCollection('documents').filter((d) => d.userId === req.user.id);
  const docNames = userDocuments.map((d) => d.name.toLowerCase());

  const withMatch = filtered.map((scheme) => {
    const score = matchScore(scheme, profile);
    const app = apps.find((a) => a.targetId === scheme.id);
    const save = saves.find((s) => s.schemeId === scheme.id);
    const missingRequirements = (scheme.requiredDocuments || []).filter(
      (doc) => !docNames.some((name) => name.includes(String(doc).toLowerCase()))
    );
    const tnwiseWeight = scheme.sdgGoalMapping.some((sdg) => TNWISE_PRIORITY_SDGS.includes(sdg)) ? 0.08 : 0;
    const deadlineWeight = scheme.deadline ? 0.04 : 0;
    const prioritizedScore = Number((score + tnwiseWeight + deadlineWeight).toFixed(3));
    const authoritativeBuiltIn = AUTHORITATIVE_BUILTIN_SCHEME_IDS.has(scheme.id);
    return {
      ...scheme,
      matchScore: score,
      prioritizedScore,
      isEligible: score >= 0.6,
      isSaved: Boolean(save),
      applicationStatus: app?.status || 'not_started',
      missingRequirements,
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
        message: `Missing requirements for ${s.schemeName}: ${s.missingRequirements.slice(0, 2).join(', ')}`,
      })),
  ];

  return res.json({
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
      dataset: 'india-national-schemes-v1',
    },
    recommended,
    eligible,
    saved,
    applied,
    highImpact,
    alerts,
  });
});

router.post('/save/:schemeId', auth, (req, res) => {
  const saves = readCollection('schemeSaves');
  const exists = saves.find((s) => s.userId === req.user.id && s.schemeId === req.params.schemeId);
  if (exists) return res.status(200).json(exists);
  const save = {
    id: nextId('save', saves),
    userId: req.user.id,
    schemeId: req.params.schemeId,
    savedAt: new Date().toISOString(),
  };
  saves.unshift(save);
  writeCollection('schemeSaves', saves);
  return res.status(201).json(save);
});

router.delete('/save/:schemeId', auth, (req, res) => {
  const saves = readCollection('schemeSaves');
  const next = saves.filter((s) => !(s.userId === req.user.id && s.schemeId === req.params.schemeId));
  writeCollection('schemeSaves', next);
  return res.status(204).send();
});

router.put('/profile', auth, (req, res) => {
  const user = findUserById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const {
    age = null,
    gender = '',
    income = null,
    location = '',
    education = '',
    occupation = '',
    socialCategory = '',
    specialConditions = [],
  } = req.body || {};
  const users = readCollection('users');
  const idx = users.findIndex((u) => u.id === req.user.id);
  users[idx] = {
    ...users[idx],
    schemeProfile: { age, gender, income, location, education, occupation, socialCategory, specialConditions },
  };
  writeCollection('users', users);
  return res.json(users[idx].schemeProfile);
});

// Admin import endpoint for future government data feed integration
router.post('/import/validate', auth, (req, res) => {
  if (!hasImportAccess(req.user)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const incoming = Array.isArray(req.body?.schemes) ? req.body.schemes : [];
  const results = incoming.map((row, idx) => validateSchemeRow(row, idx));
  const rowErrors = results.filter((r) => r.errors.length > 0);
  const duplicateIds = incoming
    .map((row) => String(row?.id || '').trim())
    .filter(Boolean)
    .filter((id, idx, ids) => ids.indexOf(id) !== idx);
  const summary = validationSummary(incoming, rowErrors, duplicateIds);
  const format = String(req.query.format || '').toLowerCase();
  const download = ['1', 'true', 'yes'].includes(String(req.query.download || '').toLowerCase());
  const stamp = new Date().toISOString().slice(0, 10);

  if (format === 'csv') {
    const report = buildCsvErrorReport(rowErrors, summary.duplicateIds);
    if (download) {
      res.setHeader('Content-Disposition', `attachment; filename="scheme-import-validation-${stamp}.csv"`);
    }
    res.type('text/csv');
    return res.send(report);
  }

  if (format === 'json' && download) {
    res.setHeader('Content-Disposition', `attachment; filename="scheme-import-validation-${stamp}.json"`);
  }
  return res.json(summary);
});

router.post('/import', auth, (req, res) => {
  if (!hasImportAccess(req.user)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const incoming = Array.isArray(req.body?.schemes) ? req.body.schemes : [];
  const results = incoming.map((row, idx) => validateSchemeRow(row, idx));
  const rowErrors = results.filter((r) => r.errors.length > 0);
  if (rowErrors.length > 0) {
    return res.status(400).json({
      message: 'Import validation failed. Fix row errors first.',
      rowErrors,
    });
  }
  const normalized = incoming.map(normalizeScheme);
  writeCollection('schemes', normalized);
  return res.json({ imported: normalized.length });
});

module.exports = router;
