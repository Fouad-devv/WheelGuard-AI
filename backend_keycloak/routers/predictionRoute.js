import express from 'express';
import multer from 'multer';
import { requireRole } from '../config/roles.js';
import {
  predict, predictBatch, getHistory, getAllPredictions, deletePrediction,
} from '../controllers/predictionController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/predict',          requireRole('operator', 'manager', 'admin'), predict);
router.post('/predict/batch',    requireRole('operator', 'manager', 'admin'), upload.single('file'), predictBatch);
router.get('/predictions/history', requireRole('operator', 'manager', 'admin'), getHistory);
router.get('/predictions/all',   requireRole('operator', 'manager', 'admin'), getAllPredictions);
router.delete('/predictions/:id', requireRole('admin'), deletePrediction);

export default router;
