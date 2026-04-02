const express = require('express');
const { auth } = require('../middlewares/auth');
const { ActivityRepository } = require('../infrastructure/persistence/ActivityRepository');

const router = express.Router();
const activityRepo = new ActivityRepository();

router.post('/yield-insight', auth, async (req, res, next) => {
  try {
    const { inputs, totalCost } = req.body;
    if (!inputs || typeof totalCost !== 'number') {
      return res.status(400).json({ error: 'invalid_agri_parameters' });
    }

    // AI/Algorithm simulation for agriculture insights
    const projectedRevenue = totalCost * (1.2 + Math.random() * 0.4); 
    const profitMargin = ((projectedRevenue - totalCost) / totalCost) * 100;

    let warning = null;
    let recommendation = '';
    
    if (totalCost > 50000) {
      warning = 'High Expenditure Detected';
      recommendation = 'Your input costs seem higher than regional averages. Consider checking AgriFlux for wholesale seed pricing and optimize fertilizer quantity.';
    } else {
      recommendation = 'Your expenditure looks optimal. Focus on soil moisture retention strategies for the upcoming dry phase to secure yield.';
    }

    activityRepo.record({ 
       userId: req.user?.id || 'system', 
       message: 'Generated Yield Market Prediction', 
       createdAt: new Date().toISOString() 
    }).catch(console.error);

    res.json({
      projectedRevenue: projectedRevenue.toFixed(2),
      profitMargin: profitMargin.toFixed(2),
      warning,
      recommendation,
      source: 'AgriFlux Market AI'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
