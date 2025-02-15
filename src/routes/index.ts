import { Router } from 'express';
import authRouter from './auth.routes';
import productRouter from '@/routes/product.routes';
import uploadRouter from '@/routes/upload.routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/products', productRouter);
router.use('/upload', uploadRouter);

export default router;
