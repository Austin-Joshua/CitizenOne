const express = require('express');
const { requireUser } = require('../middlewares/requireAuth');
const router = express.Router();

router.post('/mentor', requireUser, async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message_required' });
    
    // In production, this proxies to a career-focused LLM
    const textLower = message.toLowerCase();
    let reply = "I can help with career planning, scholarship discovery, or competitive exam roadmaps.";
    
    if (textLower.includes('neet') || textLower.includes('upsc')) {
      reply = "For competitive exams like NEET or UPSC, I recommend establishing a strict daily routine and focusing on NCERT fundamentals before moving to advanced guides. Would you like a personalized 6-month study roadmap?";
    } else if (textLower.includes('scholarship')) {
      reply = "There are several government and private scholarships available for higher education ranging from 50% to full tuition coverage. What is your current field of study?";
    } else if (textLower.includes('roadmap')) {
      reply = "Here is a quick summary roadmap:\n1. Month 1-2: Core fundamentals & NCERT\n2. Month 3-4: Advanced topics & initial mocks\n3. Month 5: Subject-wise intensive testing\n4. Month 6: Full-length mock exams and revision loop.";
    }

    res.json({ reply });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
