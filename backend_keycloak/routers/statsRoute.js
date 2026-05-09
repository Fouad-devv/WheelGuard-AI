import express from 'express';
import { requireRole } from '../config/roles.js';
import { getDashboard, getGlobal } from '../controllers/statsController.js';

const router = express.Router();

router.get('/stats/dashboard', requireRole('operator', 'manager', 'admin'), getDashboard);
router.get('/stats/global',    requireRole('manager', 'admin'),             getGlobal);

export default router;
