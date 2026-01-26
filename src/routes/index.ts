import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';

import categoryRoutes from './categoryRoutes';
import courseRoutes from './courseRoutes';
import reviewRoutes from './reviewRoutes';
import moduleRoutes from './moduleRoutes';
import classRoutes from './classRoutes';
import studentRoutes from './studentRoutes';
import cartRoutes from './cartRoutes';
import certificateRoutes from './certificateRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/courses', courseRoutes);
router.use('/', studentRoutes); // Registra na raiz para pegar /my-courses e /courses/:id/certificate
router.use('/', cartRoutes); // Registra na raiz para pegar /cart e /checkout
router.use('/reviews', reviewRoutes);
router.use('/modules', moduleRoutes);
router.use('/classes', classRoutes);
router.use('/certificates', certificateRoutes);

export default router;
