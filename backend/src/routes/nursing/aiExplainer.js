const express = require('express');
const router = express.Router();
const aiExplainerController = require('../../controllers/nursing/aiExplainerController');
const { authenticate } = require('../../middleware/auth');

router.post('/explain-topic', authenticate, aiExplainerController.explainTopic);
router.post('/solve-doubt', authenticate, aiExplainerController.solveDoubt);

module.exports = router;
