import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';

import categoryRoutes from './categoryRoutes';
import courseRoutes from './courseRoutes';
import reviewRoutes from './reviewRoutes';
import moduleRoutes from './moduleRoutes';
import { classRoutes } from './classRoutes';
import studentRoutes from './studentRoutes';
import cartRoutes from './cartRoutes';
import certificateRoutes from './certificateRoutes';

const router = Router();

// Register specific routes first
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/courses', courseRoutes);
router.use('/reviews', reviewRoutes);
router.use('/modules', moduleRoutes);
router.use('/classes', classRoutes);
router.use('/certificates', certificateRoutes);

import adminRoutes from './adminRoutes';
router.use('/admin', adminRoutes);

import viewRoutes from './viewRoutes';

// Register root catch-all or generic routes last
router.use('/', viewRoutes);
router.use('/', studentRoutes);
router.use('/', cartRoutes);

export default router;
