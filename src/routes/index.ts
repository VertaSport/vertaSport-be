import { Router } from 'express';
import authRouter from './auth.routes';
import productRouter from '@/routes/product.routes';
import uploadRouter from '@/routes/upload.routes';
import colorRouter from '@/routes/color.routes';
import cartRouter from '@/routes/cart.routes';
import sizeRouter from '@/routes/size.routes';
import cateRouter from '@/routes/cate.routes';
import orderRouter from './order.routes';
import shippingRouter from './shipping.routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/products', productRouter);
router.use('/uploads', uploadRouter);
router.use('/colors', colorRouter);
router.use('/carts', cartRouter);
router.use('/size', sizeRouter);
router.use('/cate', cateRouter);
router.use('/orders', orderRouter);
router.use('/shipping', shippingRouter);

export default router;
