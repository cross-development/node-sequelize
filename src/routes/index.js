// Packages
import { Router } from 'express';
// Routes
import authRoutes from './auth';
import userRoutes from './user';
import postRoutes from './post';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);

export default router;
