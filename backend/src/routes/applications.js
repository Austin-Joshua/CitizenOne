const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { Principal } = require('../domain/user/Principal');
const { getApplicationProcessingService } = require('../application/applications/ApplicationProcessingService');
const { handleApplicationError } = require('../interfaces/http/handleApplicationError');

router.get('/queue', auth, async (req, res, next) => {
  try {
    const principal = Principal.fromRequestUser(req.user);
    const data = await getApplicationProcessingService().listQueue(principal);
    res.json(data);
  } catch (err) {
    if (handleApplicationError(res, err, req)) return;
    next(err);
  }
});

router.get('/', auth, async (req, res, next) => {
  try {
    const principal = Principal.fromRequestUser(req.user);
    const data = await getApplicationProcessingService().listForUser(principal);
    res.json(data);
  } catch (err) {
    if (handleApplicationError(res, err, req)) return;
    next(err);
  }
});

router.post('/', auth, async (req, res, next) => {
  try {
    const principal = Principal.fromRequestUser(req.user);
    const appRow = await getApplicationProcessingService().submit(principal, req.body, req);
    res.status(201).json(appRow);
  } catch (err) {
    if (handleApplicationError(res, err, req)) return;
    next(err);
  }
});

router.patch('/:id/review', auth, async (req, res, next) => {
  try {
    const principal = Principal.fromRequestUser(req.user);
    const row = await getApplicationProcessingService().review(principal, req.params.id, req.body, req);
    res.json(row);
  } catch (err) {
    if (handleApplicationError(res, err, req)) return;
    next(err);
  }
});

router.patch('/:id', auth, async (req, res, next) => {
  try {
    const principal = Principal.fromRequestUser(req.user);
    const row = await getApplicationProcessingService().ownerPatchStatus(principal, req.params.id, req.body);
    res.json(row);
  } catch (err) {
    if (handleApplicationError(res, err, req)) return;
    next(err);
  }
});

module.exports = router;
