const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { Principal } = require('../domain/user/Principal');
const { getServiceDeskService } = require('../application/serviceDesk/ServiceDeskService');
const { handleApplicationError } = require('../interfaces/http/handleApplicationError');

router.get('/', auth, async (req, res, next) => {
  try {
    const principal = Principal.fromRequestUser(req.user);
    const data = await getServiceDeskService().listForPrincipal(principal);
    res.json(data);
  } catch (err) {
    if (handleApplicationError(res, err, req)) return;
    next(err);
  }
});

router.post('/', auth, async (req, res, next) => {
  try {
    const principal = Principal.fromRequestUser(req.user);
    const item = await getServiceDeskService().create(principal, req.body, req);
    res.status(201).json(item);
  } catch (err) {
    if (handleApplicationError(res, err, req)) return;
    next(err);
  }
});

router.patch('/:id', auth, async (req, res, next) => {
  try {
    const principal = Principal.fromRequestUser(req.user);
    const row = await getServiceDeskService().transitionByStaff(principal, req.params.id, req.body, req);
    res.json(row);
  } catch (err) {
    if (handleApplicationError(res, err, req)) return;
    next(err);
  }
});

module.exports = router;
