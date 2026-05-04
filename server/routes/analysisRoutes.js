import express from 'express';
import { chatWithDataset, createInsights } from '../controllers/analysisController.js';

const router = express.Router();

router.post('/insights', createInsights);
router.post('/ask', chatWithDataset);
router.post('/chat', chatWithDataset);

export default router;
