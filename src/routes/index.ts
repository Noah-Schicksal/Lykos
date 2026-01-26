import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';

import categoryRoutes from './categoryRoutes';
import courseRoutes from './courseRoutes';
import reviewRoutes from './reviewRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/courses', courseRoutes);
router.use('/reviews', reviewRoutes);

export default router;
