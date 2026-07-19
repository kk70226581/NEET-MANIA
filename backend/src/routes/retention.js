const express = require('express');
const { authenticate } = require('../middleware/auth');
const { getDueChallenges, startChallenge, submitChallenge } = require('../controllers/retentionController');

const router = express.Router();
router.use(authenticate);
router.get('/', getDueChallenges);
router.post('/start', startChallenge);
router.post('/submit', submitChallenge);

module.exports = router;
