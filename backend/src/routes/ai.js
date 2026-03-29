const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');

// @route   POST api/ai/simplifier
// @desc    Get simplified procedural guidance
router.post('/simplifier', auth, (req, res) => {
  const { query } = req.body;
  
  // Mock AI Logic
  const responses = {
    'passport': 'To renew your passport, you need: 1. Old Passport, 2. Proof of Address, 3. Online payment receipt. The process takes 15 days.',
    'scholarship': 'The next scholarships are: 1. AI Excellence Fund (Deadline: Mar 25), 2. STEM Growth Grant (Deadline: April 2).',
    'business': 'To start a business, register on the Udyam portal. You will need your Aadhaar and PAN cards.'
  };

  let answer = "I'm processing your request. Based on common procedures, it involves preparing identity documents and proof of residency. Would you like a specific checklist?";
  
  for (const key in responses) {
    if (query.toLowerCase().includes(key)) {
      answer = responses[key];
      break;
    }
  }

  res.json({
    answer,
    suggestions: ['Get Checklist', 'Find Office', 'Check Status']
  });
});

module.exports = router;
