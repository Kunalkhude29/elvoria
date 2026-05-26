'use strict';

const express = require('express');
const router  = express.Router();
const { lookup } = require('../controllers/pincodeController');

// GET /api/pincode/:pincode
router.get('/:pincode', lookup);

module.exports = router;
