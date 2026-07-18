const express = require('express');
const { authenticate, isAdmin } = require('../middleware/auth');
const controller = require('../controllers/pyqController');

const router = express.Router();
const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
router.use(authenticate);

router.get('/metadata', asyncRoute(controller.getMetadata));
router.get('/curriculum', asyncRoute(controller.getCurriculum));
router.get('/explore', asyncRoute(controller.explore));
router.get('/trends', asyncRoute(controller.getTrends));
router.get('/papers', asyncRoute(controller.getPapers));
router.get('/performance', asyncRoute(controller.getPerformance));
router.post('/tests', asyncRoute(controller.createCustomTest));
router.get('/questions/:id', asyncRoute(controller.getQuestionAnalysis));
router.post('/questions/:id/attempt', asyncRoute(controller.submitAttempt));
router.put('/questions/:id/bookmark', asyncRoute(controller.updateBookmark));
router.put('/questions/:id/note', asyncRoute(controller.updateNote));
router.post('/questions/:id/report', asyncRoute(controller.reportQuestion));

router.post('/admin/validate-import', isAdmin, asyncRoute(controller.validateImport));
router.post('/admin/import', isAdmin, asyncRoute(controller.importQuestions));
router.get('/admin/queue', isAdmin, asyncRoute(controller.getAdminQueue));
router.put('/admin/questions/:id/verify', isAdmin, asyncRoute(controller.verifyQuestion));
router.put('/admin/questions/:id/publish', isAdmin, asyncRoute(controller.publishVerifiedQuestion));
router.get('/admin/reports', isAdmin, asyncRoute(controller.getAdminReports));
router.put('/admin/reports/:interactionId/:reportId', isAdmin, asyncRoute(controller.resolveReport));

router.use(controller.handleError);
module.exports = router;
