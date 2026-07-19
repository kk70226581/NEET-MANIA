const express = require('express');
const { authenticate, isAdmin } = require('../middleware/auth');
const { getOverview } = require('../controllers/adminController');

const router = express.Router();

router.get('/overview', authenticate, isAdmin, getOverview);

module.exports = router;
