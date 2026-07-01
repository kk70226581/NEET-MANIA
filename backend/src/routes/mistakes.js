const express = require('express');
const { authenticate } = require('../middleware/auth');
const { getMistakes, updateMistake } = require('../controllers/mistakeController');

const router = express.Router();
router.use(authenticate);
router.get('/', getMistakes);
router.patch('/:id', updateMistake);

module.exports = router;
