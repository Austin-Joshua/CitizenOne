const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middlewares/auth');
const router = express.Router();

// Mock AI responder for Skill-to-Income
router.post(
  '/skill-to-income',
  auth,
  [body('skills').isString().notEmpty()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const skills = req.body.skills.toLowerCase();
    
    let opportunities = [
      {
        title: 'Micro-Enterprise Loan',
        type: 'Business Idea',
        description: 'Start a small local business with a collateral-free loan up to ₹50,000 under the Mudra scheme.',
        action: 'Apply via Schemes'
      },
      {
        title: 'Digital Marketing Fundamentals',
        type: 'Training Program',
        description: 'Free online certification providing essential online selling and marketing skills.',
        action: 'Enroll for Free'
      }
    ];

    if (skills.includes('sewing') || skills.includes('tailor') || skills.includes('stitch')) {
      opportunities.unshift({
        title: 'Textile Artisan Co-op',
        type: 'Job Suggestion',
        description: 'Join the local artisan cooperative for steady garment production contracts with guaranteed minimum wages.',
        action: 'Connect to SHG'
      });
    }

    if (skills.includes('code') || skills.includes('comput') || skills.includes('tech')) {
      opportunities.unshift({
        title: 'Freelance Tech Support',
        type: 'Income Pathway',
        description: 'Provide remote IT support. Requires reliable internet. Average pay ₹300-500/hr.',
        action: 'View Platform'
      });
    }

    setTimeout(() => {
      res.json({ success: true, pathways: opportunities });
    }, 1200); // simulate thinking
  }
);

// Mock AI Mentor chat
router.post(
  '/mentor',
  auth,
  [body('message').isString().notEmpty()],
  (req, res) => {
    const msg = req.body.message.toLowerCase();
    let reply = "That's a great question. As your AI mentor, I recommend exploring local Self-Help Groups (SHGs) or applying for skill-based programs in the Opportunity Hub. How else can I assist you today?";

    if (msg.includes('loan') || msg.includes('money') || msg.includes('finance')) {
      reply = "If you're looking for financial assistance, there are several zero-interest or subsidized loans for women entrepreneurs. Have you checked the 'Skill to Income' engine to see which you qualify for?";
    } else if (msg.includes('safe') || msg.includes('abuse') || msg.includes('help')) {
      reply = "Your safety is paramount. Please immediately contact the Women's Helpline at 181, or check the Safety & Legal tab for immediate legal aid contacts. You are not alone.";
    } else if (msg.includes('child') || msg.includes('pregnant') || msg.includes('baby')) {
      reply = "For maternal and child health, we offer dedicated nutrition and financial subsidy schemes. Under the 'Mother & Child Support' tab, you can enroll in maternity benefits.";
    }

    setTimeout(() => {
      res.json({ reply });
    }, 1500); // simulate thinking
  }
);

// Incident Reporting & AI Guidance
router.post(
  '/incident',
  /* auth middleware skipped to allow anonymous reporting */
  [body('description').isString().notEmpty()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const desc = req.body.description.toLowerCase();
    
    // Simulate AI classification
    let classification = 'MODERATE';
    let steps = [
      "Document everything including times, dates, and witnesses.",
      "Consider reaching out to a local counseling center for emotional support."
    ];
    let routeTo = 'Counseling & Support Services';

    if (desc.includes('rape') || desc.includes('assault') || desc.includes('hit') || desc.includes('beat') || desc.includes('violence')) {
      classification = 'CRITICAL';
      steps = [
        "Get to a safe place immediately. Do not stay alone if possible.",
        "Do not shower, wash your clothes, or destroy any evidence if it was a physical assault.",
        "Seek immediate medical attention at the nearest hospital.",
        "File a police complaint (FIR). You have the right to a Zero FIR at any police station."
      ];
      routeTo = 'Immediate Police & Medical Intervention';
    } else if (desc.includes('harass') || desc.includes('stalk') || desc.includes('threat')) {
      classification = 'HIGH';
      steps = [
        "Do not engage with the perpetrator.",
        "Take screenshots of any digital threats or harassment.",
        "Inform a trusted friend or family member about your situation.",
        "Contact the Women's National Cyber Crime portal or local police station."
      ];
      routeTo = 'Cyber Crime / Protective Services';
    }

    setTimeout(() => {
      res.json({
        success: true,
        guidance: {
          classification,
          routeTo,
          steps,
          helplines: [
            { name: "Women's Helpline", number: "181" },
            { name: "Police", number: "112" },
            { name: "National Comm. for Women", number: "7827170170" }
          ]
        }
      });
    }, 2000);
  }
);

module.exports = router;
