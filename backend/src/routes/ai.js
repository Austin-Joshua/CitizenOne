const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { readCollection } = require('../lib/dataStore');
const { findUserById } = require('../lib/userStore');

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Normalise a string for fuzzy matching */
function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Simple keyword overlap score between query tokens and a target string */
function tokenScore(queryTokens, target) {
  const t = norm(target);
  let hits = 0;
  for (const tok of queryTokens) {
    if (t.includes(tok)) hits++;
  }
  return queryTokens.length > 0 ? hits / queryTokens.length : 0;
}

/** Score a scheme against a search query */
function scoreScheme(scheme, queryTokens) {
  const fields = [
    { weight: 3.0, text: scheme.schemeName },
    { weight: 2.5, text: scheme.category },
    { weight: 2.0, text: scheme.description },
    { weight: 1.5, text: (scheme.targetBeneficiaries || []).join(' ') },
    { weight: 1.5, text: (scheme.benefitsOffered || []).join(' ') },
    { weight: 1.0, text: (scheme.guidanceSteps || []).join(' ') },
    { weight: 1.0, text: (scheme.lifeEvents || []).join(' ') },
    { weight: 0.8, text: scheme.ministryOrDepartment },
  ];
  let total = 0;
  let maxWeight = 0;
  for (const f of fields) {
    total += f.weight * tokenScore(queryTokens, f.text);
    maxWeight += f.weight;
  }
  return maxWeight > 0 ? total / maxWeight : 0;
}

/** Build a structured response object from a scheme */
function buildSchemeResponse(scheme) {
  const docs = [];
  if (Array.isArray(scheme.documentRequirements) && scheme.documentRequirements.length) {
    scheme.documentRequirements.forEach((d) => docs.push({
      label: d.label,
      category: d.category || null,
      required: d.required !== false,
    }));
  } else if (Array.isArray(scheme.requiredDocuments)) {
    scheme.requiredDocuments.forEach((d) => docs.push({
      label: d,
      category: null,
      required: true,
    }));
  }

  const eligibility = [];
  const ec = scheme.eligibilityCriteria || {};
  if (ec.age?.min || ec.age?.max) {
    const parts = [];
    if (ec.age.min) parts.push(`Minimum age: ${ec.age.min}`);
    if (ec.age.max) parts.push(`Maximum age: ${ec.age.max}`);
    eligibility.push(parts.join(', '));
  }
  if (ec.gender?.length) eligibility.push(`Gender: ${ec.gender.join(', ')}`);
  if (ec.income?.max) eligibility.push(`Income limit: ₹${Number(ec.income.max).toLocaleString('en-IN')}/year`);
  if (ec.occupation?.length) eligibility.push(`Occupation: ${ec.occupation.join(', ')}`);
  if (ec.socialCategory?.length) eligibility.push(`Category: ${ec.socialCategory.join(', ').toUpperCase()}`);
  if (ec.location?.length) {
    const locs = ec.location.filter((l) => !['india'].includes(l));
    if (locs.length) eligibility.push(`Location: ${locs.join(', ')}`);
  }
  if (ec.specialConditions?.length) eligibility.push(`Conditions: ${ec.specialConditions.join(', ')}`);
  if (eligibility.length === 0) eligibility.push('Open to all eligible citizens');

  let benefitText = null;
  if (scheme.benefitEstimate) {
    const be = scheme.benefitEstimate;
    if (be.narrative) {
      benefitText = be.narrative;
    } else if (be.amountMax) {
      const cur = be.currency === 'INR' ? '₹' : (be.currency || '₹');
      benefitText = `Up to ${cur}${Number(be.amountMax).toLocaleString('en-IN')} ${be.unit || ''}`.trim();
    }
  }
  if (!benefitText && scheme.benefitsOffered?.length) {
    benefitText = scheme.benefitsOffered.join(', ');
  }

  return {
    type: 'scheme_guidance',
    schemeId: scheme.id,
    schemeName: scheme.schemeName,
    category: scheme.category,
    governmentLevel: scheme.governmentLevel,
    ministry: scheme.ministryOrDepartment,
    summary: scheme.description,
    eligibility,
    documents: docs,
    steps: scheme.guidanceSteps || [],
    benefits: benefitText,
    applicationMode: scheme.applicationMode,
    processingDays: scheme.estimatedProcessingTimeDays || null,
    deadline: scheme.deadline || null,
    officialLink: scheme.officialLink || null,
    whereToApply: scheme.whereToApply || null,
    renewalInfo: scheme.renewalCycle || null,
    supportContacts: scheme.supportContacts || [],
  };
}

// ─── Keyword → category / intent mapping ────────────────────────────────────
const INTENT_KEYWORDS = {
  agriculture: ['farm', 'farmer', 'crop', 'kisan', 'agri', 'agriculture', 'farming', 'harvest', 'seed', 'irrigation', 'fertilizer'],
  insurance: ['insurance', 'bima', 'suraksha', 'coverage', 'accident', 'life insurance', 'crop insurance'],
  health: ['health', 'hospital', 'medical', 'ayushman', 'doctor', 'treatment', 'medicine', 'pregnancy', 'maternity', 'maternal'],
  housing: ['house', 'housing', 'home', 'awas', 'shelter', 'rent', 'construction'],
  education: ['education', 'school', 'college', 'scholarship', 'student', 'study', 'learning', 'skill', 'training'],
  employment: ['job', 'employment', 'work', 'mgnrega', 'nrega', 'wage', 'labour', 'labor', 'unemployment'],
  finance: ['loan', 'credit', 'bank', 'account', 'mudra', 'finance', 'pension', 'saving', 'subsidy'],
  startup: ['startup', 'business', 'entrepreneur', 'enterprise', 'msme', 'venture'],
  women: ['women', 'girl', 'female', 'woman', 'sukanya', 'mahila'],
  food: ['food', 'ration', 'pds', 'grain', 'hunger', 'nutrition', 'anna'],
  sanitation: ['toilet', 'sanitation', 'swachh', 'clean', 'water', 'jal', 'drinking water'],
  social: ['pension', 'old age', 'senior', 'disability', 'widow', 'retirement'],
};

// ─── Conversation store (in-memory, ephemeral) ─────────────────────────────
const conversations = new Map(); // conversationId → { messages[], userId, lastAccess }

function getOrCreateConversation(conversationId, userId) {
  if (conversationId && conversations.has(conversationId)) {
    const conv = conversations.get(conversationId);
    conv.lastAccess = Date.now();
    return conv;
  }
  const id = conversationId || `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const conv = { id, userId, messages: [], lastAccess: Date.now() };
  conversations.set(id, conv);
  // Cleanup old conversations
  if (conversations.size > 200) {
    const oldest = [...conversations.entries()]
      .sort((a, b) => a[1].lastAccess - b[1].lastAccess)
      .slice(0, 50);
    oldest.forEach(([k]) => conversations.delete(k));
  }
  return conv;
}

// ─── General knowledge responses ────────────────────────────────────────────
const GENERAL_RESPONSES = [
  {
    patterns: ['eligib', 'am i eligible', 'check my eligib', 'qualify'],
    response: {
      type: 'general_guidance',
      summary: "I can help you check eligibility for various government schemes. To give you the best results, please tell me what specific scheme or area you're interested in (e.g., housing, health, agriculture, education). I'll also use your profile information to personalize recommendations.",
      steps: [
        'Tell me which area interests you (health, education, housing, etc.)',
        'I\'ll match you with relevant schemes based on your profile',
        'Review the eligibility criteria for each scheme',
        'Start your application through the recommended channel',
      ],
    },
  },
  {
    patterns: ['document', 'what documents', 'papers needed', 'paperwork'],
    response: {
      type: 'general_guidance',
      summary: "Most government schemes require some combination of identity, address, and income documents. Here are the most commonly needed documents across schemes:",
      steps: [
        'Aadhaar Card (required for almost all schemes)',
        'Income Certificate (for income-based eligibility)',
        'Residence / Address Proof',
        'Bank Account Passbook with IFSC',
        'Ration Card (for food and subsidy schemes)',
        'Caste Certificate (for SC/ST/OBC category schemes)',
        'Land Records (for agriculture schemes)',
      ],
    },
  },
  {
    patterns: ['apply', 'how to apply', 'application process', 'how do i apply'],
    response: {
      type: 'general_guidance',
      summary: 'The application process varies by scheme, but generally follows these steps. Tell me which specific scheme you want to apply for, and I\'ll give you detailed guidance.',
      steps: [
        'Check your eligibility for the scheme',
        'Gather required documents (usually Aadhaar, income proof, address proof)',
        'Visit the official portal or nearest Common Service Centre (CSC)',
        'Fill out the application form with accurate details',
        'Upload or submit required documents',
        'Note down your application/reference number',
        'Track your application status online or at the office',
      ],
    },
  },
  {
    patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'namaste'],
    response: {
      type: 'greeting',
      summary: "Hello! 👋 I'm your Bureaucracy Simplifier — I help you navigate government schemes, understand complex rules, and guide you step-by-step through applications. What would you like help with today?",
      steps: [],
    },
  },
  {
    patterns: ['thank', 'thanks', 'helpful', 'great'],
    response: {
      type: 'greeting',
      summary: "You're welcome! 😊 I'm here to help make government processes simpler for you. Feel free to ask about any other scheme or process you need help with.",
      steps: [],
    },
  },
];

// ────────────────────────────────────────────────────────────────────────────
// ROUTES
// ────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/ai/chat
 * Main conversational endpoint for the Bureaucracy Simplifier.
 */
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    const query = message.trim();
    const queryNorm = norm(query);
    const queryTokens = queryNorm.split(' ').filter((t) => t.length > 1);

    // Get or create conversation
    const conv = getOrCreateConversation(conversationId, req.user.id);
    conv.messages.push({ role: 'user', text: query, at: new Date().toISOString() });

    // Load user profile for personalization
    const user = await findUserById(req.user.id);
    const profile = user?.schemeProfile || {};

    // Load all schemes
    const schemes = await readCollection('schemes');

    // 1. Check general knowledge responses first
    for (const gr of GENERAL_RESPONSES) {
      if (gr.patterns.some((p) => queryNorm.includes(p))) {
        const resp = {
          response: { ...gr.response },
          suggestions: buildSuggestions(profile, queryTokens),
          conversationId: conv.id,
          personalization: buildPersonalization(user, profile),
        };
        conv.messages.push({ role: 'assistant', data: resp.response, at: new Date().toISOString() });
        return res.json(resp);
      }
    }

    // 2. Score all schemes against the query
    const scored = schemes
      .filter((s) => s.status === 'active')
      .map((s) => ({ scheme: s, score: scoreScheme(s, queryTokens) }))
      .filter((s) => s.score > 0.05)
      .sort((a, b) => b.score - a.score);

    // 3. If user profile can boost relevance, do so
    if (profile.stateCode || profile.occupation) {
      scored.forEach((item) => {
        const ec = item.scheme.eligibilityCriteria || {};
        if (profile.occupation && ec.occupation?.length) {
          if (ec.occupation.some((o) => norm(o).includes(norm(profile.occupation)))) {
            item.score *= 1.3;
          }
        }
        if (profile.stateCode) {
          const coverage = (item.scheme.geographicCoverage || []).map(norm);
          if (coverage.some((g) => g.includes(norm(profile.stateCode)))) {
            item.score *= 1.15;
          }
        }
      });
      scored.sort((a, b) => b.score - a.score);
    }

    // 4. Build response
    if (scored.length > 0) {
      const topScheme = scored[0].scheme;
      const response = buildSchemeResponse(topScheme);

      // Add related schemes
      const related = scored.slice(1, 4).map((s) => ({
        schemeId: s.scheme.id,
        schemeName: s.scheme.schemeName,
        category: s.scheme.category,
        summary: s.scheme.description,
        matchScore: Math.round(s.score * 100),
      }));

      const suggestions = [
        `What documents do I need for ${topScheme.schemeName}?`,
        `Am I eligible for ${topScheme.schemeName}?`,
        'Show me more schemes like this',
      ];

      if (topScheme.deadline) {
        suggestions.push(`What is the deadline for ${topScheme.schemeName}?`);
      }

      const resp = {
        response,
        relatedSchemes: related,
        suggestions: suggestions.slice(0, 4),
        conversationId: conv.id,
        personalization: buildPersonalization(user, profile),
      };
      conv.messages.push({ role: 'assistant', data: resp.response, at: new Date().toISOString() });
      return res.json(resp);
    }

    // 5. No scheme match — provide helpful fallback
    const fallback = {
      response: {
        type: 'uncertain',
        summary: "I'm not fully sure about this specific topic, but here's the best guidance based on available information. Try asking about specific schemes like crop insurance, housing subsidies, health coverage, pension schemes, or education scholarships.",
        steps: [
          'Browse available schemes in the Benefits section',
          'Use your profile to get personalized scheme recommendations',
          'Contact your nearest Common Service Centre (CSC) for direct assistance',
          'Visit the official government portal for your state',
        ],
      },
      suggestions: buildSuggestions(profile, queryTokens),
      conversationId: conv.id,
      personalization: buildPersonalization(user, profile),
    };
    conv.messages.push({ role: 'assistant', data: fallback.response, at: new Date().toISOString() });
    return res.json(fallback);
  } catch (err) {
    console.error('[AI Chat Error]', err);
    return res.status(500).json({ message: 'AI service temporarily unavailable.' });
  }
});

/**
 * POST /api/ai/simplify
 * Simplify pasted government text / circular.
 */
router.post('/simplify', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length < 10) {
      return res.status(400).json({ message: 'Please provide at least 10 characters of text to simplify.' });
    }

    const input = text.trim();
    const inputNorm = norm(input);
    const inputTokens = inputNorm.split(' ').filter((t) => t.length > 2);

    // Load schemes to find related ones
    const schemes = await readCollection('schemes');
    const scored = schemes
      .filter((s) => s.status === 'active')
      .map((s) => ({ scheme: s, score: scoreScheme(s, inputTokens) }))
      .filter((s) => s.score > 0.04)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    // Extract key sentences (simple heuristic: sentences with important keywords)
    const sentences = input.split(/[.;]\s+/).filter((s) => s.trim().length > 10);
    const importantKeywords = ['eligible', 'benefit', 'apply', 'document', 'required', 'deadline', 'amount', 'subsidy', 'scheme', 'programme', 'income', 'age', 'aadhaar', 'certificate'];
    const keySentences = sentences.filter((s) => {
      const sn = norm(s);
      return importantKeywords.some((kw) => sn.includes(kw));
    });

    // Extract benefits
    const benefitKeywords = ['benefit', 'subsidy', 'grant', 'allowance', 'pension', 'insurance', 'coverage', 'support', 'assistance', 'loan'];
    const keyBenefits = sentences
      .filter((s) => benefitKeywords.some((kw) => norm(s).includes(kw)))
      .slice(0, 5)
      .map((s) => s.trim().replace(/^[-•*]\s*/, ''));

    // Build simplified summary
    const wordCount = input.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    const simplified = keySentences.length > 0
      ? keySentences.slice(0, 4).map((s) => s.trim()).join('. ') + '.'
      : `This document contains ${wordCount} words (about ${readingTime} min read). It appears to cover government policies or procedures. Key topics detected: ${inputTokens.slice(0, 8).join(', ')}.`;

    const actions = [];
    if (scored.length > 0) {
      actions.push(`Check eligibility for ${scored[0].scheme.schemeName}`);
      actions.push('View required documents');
    }
    actions.push('Save this summary for later');
    actions.push('Ask a follow-up question about this text');

    return res.json({
      simplified,
      keyBenefits: keyBenefits.length > 0 ? keyBenefits : ['No specific benefits detected in the text — try pasting a longer excerpt.'],
      actions,
      relatedSchemes: scored.map((s) => ({
        schemeId: s.scheme.id,
        schemeName: s.scheme.schemeName,
        category: s.scheme.category,
        matchScore: Math.round(s.score * 100),
      })),
      stats: { wordCount, readingTime: `${readingTime} min` },
    });
  } catch (err) {
    console.error('[AI Simplify Error]', err);
    return res.status(500).json({ message: 'Simplification service temporarily unavailable.' });
  }
});

/**
 * GET /api/ai/suggestions
 * Personalized starter suggestions based on user profile.
 */
router.get('/suggestions', auth, async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    const profile = user?.schemeProfile || {};
    const role = user?.role || 'citizen';

    const suggestions = [];

    // Profile-based suggestions
    if (profile.occupation) {
      const occ = norm(profile.occupation);
      if (occ.includes('farmer') || occ.includes('agri')) {
        suggestions.push('How to apply for crop insurance?', 'What schemes are available for farmers?', 'How to get PM Kisan benefits?');
      }
      if (occ.includes('student') || role === 'student') {
        suggestions.push('What scholarships am I eligible for?', 'How to apply for skill development programs?');
      }
      if (occ.includes('entrepreneur') || occ.includes('business') || occ.includes('self_employed')) {
        suggestions.push('How to get a MUDRA loan?', 'What is Startup India?', 'How to register a business?');
      }
    }

    if (profile.stateCode) {
      const state = norm(profile.stateCode);
      if (state.includes('tamil') || state.includes('tn')) {
        suggestions.push('What Tamil Nadu state schemes am I eligible for?');
      }
    }

    // Default suggestions
    if (suggestions.length < 4) {
      const defaults = [
        'How to apply for Ayushman Bharat health cover?',
        'What housing schemes are available?',
        'How to open a Jan Dhan bank account?',
        'What pension schemes can I join?',
        'How to check my scheme eligibility?',
        'What documents do I need for government schemes?',
        'How do I apply for crop insurance?',
        'What insurance schemes are available?',
      ];
      for (const d of defaults) {
        if (!suggestions.includes(d) && suggestions.length < 6) {
          suggestions.push(d);
        }
      }
    }

    return res.json({
      suggestions: suggestions.slice(0, 6),
      personalization: buildPersonalization(user, profile),
    });
  } catch (err) {
    console.error('[AI Suggestions Error]', err);
    return res.json({ suggestions: ['How to check my eligibility?', 'What schemes are available?'], personalization: null });
  }
});

// Legacy endpoint — keep backward compat
router.post('/simplifier', auth, async (req, res) => {
  const { query } = req.body;
  // Forward to new chat endpoint internally
  req.body.message = query;
  return router.handle(req, res);
});

// ─── Helper builders ────────────────────────────────────────────────────────

function buildSuggestions(profile, queryTokens) {
  const suggestions = [];
  const occ = norm(profile?.occupation || '');

  // Context-aware suggestions based on detected intent
  for (const [category, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (queryTokens.some((t) => keywords.includes(t))) {
      switch (category) {
        case 'agriculture':
          suggestions.push('How to apply for crop insurance?', 'PM Kisan benefits explained');
          break;
        case 'health':
          suggestions.push('How to get Ayushman Bharat card?', 'Free maternity benefits');
          break;
        case 'housing':
          suggestions.push('Housing subsidy under PMAY', 'How to apply for affordable housing?');
          break;
        case 'education':
          suggestions.push('Available scholarships', 'Skill development programs');
          break;
        case 'finance':
          suggestions.push('How to open Jan Dhan account?', 'MUDRA loan process');
          break;
        case 'startup':
          suggestions.push('Startup India registration', 'Stand-Up India loans');
          break;
        default:
          break;
      }
    }
  }

  if (suggestions.length === 0) {
    suggestions.push(
      'What schemes am I eligible for?',
      'Show me health insurance options',
      'How to apply for housing subsidy?',
      'Pension schemes for workers',
    );
  }

  return [...new Set(suggestions)].slice(0, 4);
}

function buildPersonalization(user, profile) {
  if (!user) return null;
  const parts = [];
  if (user.name) parts.push(`name: ${user.name}`);
  if (profile.stateCode) parts.push(`state: ${profile.stateCode}`);
  if (profile.occupation) parts.push(`occupation: ${profile.occupation}`);
  if (profile.age) parts.push(`age: ${profile.age}`);
  return parts.length > 0 ? { detected: parts.join(', '), profileComplete: Object.keys(profile).length >= 3 } : null;
}

module.exports = router;
