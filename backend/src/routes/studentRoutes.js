const express = require('express');
const { auth } = require('../middlewares/auth');
const { ActivityRepository } = require('../infrastructure/persistence/ActivityRepository');

const router = express.Router();
const activityRepo = new ActivityRepository();

router.post('/mentor', auth, async (req, res, next) => {
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
    
    activityRepo.record({ 
       userId: req.user?.id || 'system', 
       message: 'Consulted AI Study Mentor', 
       createdAt: new Date().toISOString() 
    }).catch(console.error);

    res.json({ reply });
  } catch (err) {
    next(err);
  }
});

router.post('/colleges', async (req, res, next) => {
  try {
    const { marks10, marks12, cutoff } = req.body;
    if (!marks10 || !marks12) return res.status(400).json({ error: 'marks_required' });

    let matches = [
        { name: 'National Institute of Technology', course: 'B.Tech Computer Science', eligibility: 'High Match', type: 'Public' },
        { name: 'State Engineering College', course: 'B.E. Information Technology', eligibility: 'Guaranteed', type: 'State' },
        { name: 'City Commerce University', course: 'B.Com (Hons)', eligibility: 'Eligible', type: 'Private' }
    ];

    if (parseFloat(marks12) > 95) {
        matches.unshift({ name: 'Indian Institute of Technology (IIT)', course: 'B.Tech Core', eligibility: 'High Match', type: 'Public Premier' });
    } else if (parseFloat(marks12) < 70) {
        matches = [
           { name: 'Regional Technical Institute', course: 'Diploma in Computer Engg', eligibility: 'Guaranteed Match', type: 'State' },
           { name: 'City Commerce University', course: 'B.A. General', eligibility: 'Accessible', type: 'Private' }
        ];
    }

    activityRepo.record({ 
       userId: req.user?.id || 'system', 
       message: 'Analyzed College Placements', 
       createdAt: new Date().toISOString() 
    }).catch(console.error);

    res.json({ matches });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
