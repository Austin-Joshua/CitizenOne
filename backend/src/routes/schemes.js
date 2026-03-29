const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { readCollection, writeCollection, nextId } = require('../lib/dataStore');
const { findUserById, updateUser } = require('../lib/userStore');
const { mergeSchemeProfile } = require('../lib/schemeProfile');
const { normalizeScheme, SOURCE_TYPES } = require('../lib/schemeNormalization');
const { getSchemeIntelligenceService } = require('../application/schemeIntelligence/SchemeIntelligenceService');

const TRACKING_STATES = ['not_started', 'in_progress', 'submitted', 'under_review', 'approved', 'rejected'];

const SCHEME_SCHEMA = {
  id: 'string',
  schemeName: 'string',
  governmentLevel: 'central|state',
  ministryOrDepartment: 'string',
  targetBeneficiaries: 'string[]',
  targetStates: 'string[] (ISO-like codes or slugs, e.g. TN, tamil_nadu)',
  description: 'string',
  benefitsOffered: 'string[]',
  eligibilityCriteria: {
    age: { min: 'number?', max: 'number?' },
    gender: 'string[]',
    income: { max: 'number?' },
    location: 'string[]',
    states: 'string[]',
    districts: 'string[]',
    settlementTypes: 'string[] (rural|urban)',
    maritalStatus: 'string[]',
    education: 'string[]',
    occupation: 'string[]',
    socialCategory: 'string[]',
    specialConditions: 'string[]',
  },
  requiredDocuments: 'string[] (legacy; mirrored from documentRequirements)',
  documentRequirements: '{ id, label, category, required }[]',
  applicationMode: 'online|offline|hybrid',
  officialLink: 'string',
  deadline: 'string (ISO date)',
  applicationWindow: '{ type, opensAt, closesAt, notes }',
  renewalCycle: 'string',
  renewalRequirements: 'string',
  whereToApply: 'string',
  geographicCoverage: 'string[]',
  status: 'active|inactive',
  sdgGoalMapping: 'string[]',
  lifeEvents: 'string[]',
  benefitEstimate: '{ amountMin, amountMax, currency, unit, narrative }',
  supportContacts: '{ name, role, phone, email, address, hours }[]',
  sourceAttribution: {
    sourceType: 'official_portal|government_compendium|policy_brief|gazette_notice',
    lastVerifiedDate: 'string (ISO date)',
    policyNotes: 'string',
  },
  category: 'string',
  estimatedProcessingTimeDays: 'number?',
  guidanceSteps: 'string[]',
};

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
  const hasDocShape =
    Array.isArray(row.requiredDocuments) ||
    (Array.isArray(row.documentRequirements) && row.documentRequirements.length > 0);
  if (!hasDocShape) errors.push('requiredDocuments or documentRequirements must be provided');
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

const SCHEME_USER_PROFILE_SCHEMA = {
  age: 'number?',
  gender: 'string',
  maritalStatus: 'string',
  income: 'number?',
  occupation: 'string',
  education: 'string',
  stateCode: 'string',
  district: 'string',
  settlement: 'rural|urban|""',
  socialCategory: 'string',
  familyHouseholdSize: 'number?',
  dependentsUnder18: 'number?',
  specialConditions: 'string[]',
  location: 'string (legacy, synced with settlement)',
};

router.get('/schema', auth, (req, res) => {
  res.json({
    schema: SCHEME_SCHEMA,
    trackingStates: TRACKING_STATES,
    schemeUserProfile: SCHEME_USER_PROFILE_SCHEMA,
  });
});

router.get('/', auth, async (req, res) => {
  const raw = await readCollection('schemes');
  const rows = raw.map(normalizeScheme);
  res.json(rows);
});

router.get('/intelligence', auth, async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const payload = await getSchemeIntelligenceService().buildIntelligenceSnapshot({
    userId: req.user.id,
    profile: user.schemeProfile || {},
    query: req.query,
  });
  return res.json(payload);
});

router.post('/save/:schemeId', auth, async (req, res) => {
  const saves = await readCollection('schemeSaves');
  const exists = saves.find((s) => s.userId === req.user.id && s.schemeId === req.params.schemeId);
  if (exists) return res.status(200).json(exists);
  const save = {
    id: nextId('save', saves),
    userId: req.user.id,
    schemeId: req.params.schemeId,
    savedAt: new Date().toISOString(),
  };
  saves.unshift(save);
  await writeCollection('schemeSaves', saves);
  return res.status(201).json(save);
});

router.delete('/save/:schemeId', auth, async (req, res) => {
  const saves = await readCollection('schemeSaves');
  const next = saves.filter((s) => !(s.userId === req.user.id && s.schemeId === req.params.schemeId));
  await writeCollection('schemeSaves', next);
  return res.status(204).send();
});

router.put('/profile', auth, async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const next = mergeSchemeProfile(user.schemeProfile || {}, req.body || {});
  const updated = await updateUser(user.id, { schemeProfile: next });
  return res.json(updated.schemeProfile);
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

router.post('/import', auth, async (req, res) => {
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
  await writeCollection('schemes', normalized);
  return res.json({ imported: normalized.length });
});

module.exports = router;
