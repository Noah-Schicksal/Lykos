import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';

import categoryRoutes from './categoryRoutes';
import courseRoutes from './courseRoutes';
import reviewRoutes from './reviewRoutes';
import moduleRoutes from './moduleRoutes';
import classRoutes from './classRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/courses', courseRoutes);
router.use('/reviews', reviewRoutes);
router.use('/modules', moduleRoutes);
router.use('/classes', classRoutes);

export default router;
