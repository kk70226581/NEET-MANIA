const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../../middleware/auth');
const rateLimit = require('../../middleware/nursingRateLimit');
const controller = require('../../controllers/nursing/nursingContentController');

router.get('/catalog', controller.getCatalog);
router.get('/questions', authenticate, controller.getQuestions);
router.get('/questions/:id', authenticate, controller.getQuestion);
router.post('/questions/:id/answer', authenticate, rateLimit({ max: 120 }), controller.answerQuestion);
router.get('/analytics', authenticate, controller.getAnalytics);

router.get('/admin/stats', authenticate, isAdmin, controller.getAdminStats);
router.get('/admin/questions', authenticate, isAdmin, controller.getAdminQuestions);
router.post('/admin/questions', authenticate, isAdmin, controller.createQuestion);
router.put('/admin/questions/:id', authenticate, isAdmin, controller.updateQuestion);
router.delete('/admin/questions/:id', authenticate, isAdmin, controller.archiveQuestion);
router.post('/admin/questions/review', authenticate, isAdmin, controller.reviewQuestions);
router.post('/admin/questions/validate', authenticate, isAdmin, controller.validateQuestion);
router.get('/admin/questions/:id/versions', authenticate, isAdmin, controller.getVersions);
router.post('/admin/questions/:id/versions/:version/restore', authenticate, isAdmin, controller.restoreVersion);
router.post('/admin/questions/:id/improve', authenticate, isAdmin, rateLimit({ max: 10 }), controller.improveQuestion);
router.post('/admin/imports/preview', authenticate, isAdmin, rateLimit({ max: 10 }), controller.previewImport);
router.post('/admin/imports/commit', authenticate, isAdmin, rateLimit({ max: 10 }), controller.commitImport);
router.get('/admin/sources', authenticate, isAdmin, controller.getSources);
router.post('/admin/sources', authenticate, isAdmin, controller.createSource);
router.put('/admin/sources/:id', authenticate, isAdmin, controller.updateSource);
router.get('/admin/coverage', authenticate, isAdmin, controller.getCoverage);
router.post('/admin/coverage/:chapterId/fill', authenticate, isAdmin, controller.fillCoverageGap);
router.get('/admin/generation-jobs', authenticate, isAdmin, controller.getGenerationJobs);
router.post('/admin/generation-jobs', authenticate, isAdmin, rateLimit({ max: 10 }), controller.createGenerationJob);
router.post('/admin/generation-jobs/:id/process', authenticate, isAdmin, rateLimit({ max: 15 }), controller.processGenerationJob);
router.post('/admin/generation-jobs/:id/retry', authenticate, isAdmin, controller.retryGenerationJob);
router.post('/admin/generation-jobs/:id/cancel', authenticate, isAdmin, controller.cancelGenerationJob);

module.exports = router;
