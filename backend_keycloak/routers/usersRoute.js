import express from 'express';
import { requireRole } from '../config/roles.js';
import { getUsers, createUser, deleteUser, resetPassword } from '../controllers/usersController.js';

const router = express.Router();

router.get('/users',                    requireRole('admin'), getUsers);
router.post('/users',                   requireRole('admin'), createUser);
router.delete('/users/:id',             requireRole('admin'), deleteUser);
router.put('/users/:id/reset-password', requireRole('admin'), resetPassword);

export default router;
