import express from 'express';
import { deleteAnalysis, getAnalysis, getHistory } from '../controllers/historyController.js';
import { ensureAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(ensureAuthenticated);
router.get('/', getHistory);
router.get('/:id', getAnalysis);
router.delete('/:id', deleteAnalysis);

export default router;

