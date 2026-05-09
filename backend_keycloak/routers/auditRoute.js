import express from 'express';
import { requireRole } from '../config/roles.js';
import { getAuditLogs } from '../controllers/auditController.js';

const router = express.Router();

router.get('/audit-logs', requireRole('admin'), getAuditLogs);

export default router;
