const express = require('express');
const { requireUser } = require('../middlewares/requireAuth');
const router = express.Router();

router.post('/yield-insight', requireUser, async (req, res, next) => {
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
