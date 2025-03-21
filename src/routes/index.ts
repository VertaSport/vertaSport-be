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
import userRouter from './user.routes';
import payosRouter from './payos.routes';
import addressRouter from './address.routes';
import reviewRouter from './reviews.routes';
import statsRouter from './stats.routes';
import voucherRouter from '@/routes/voucher.routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/products', productRouter);
router.use('/uploads', uploadRouter);
router.use('/colors', colorRouter);
router.use('/carts', cartRouter);
router.use('/sizes', sizeRouter);
router.use('/cate', cateRouter);
router.use('/orders', orderRouter);
router.use('/shipping', shippingRouter);
router.use('/payos', payosRouter);
router.use('/address', addressRouter);
router.use('/review', reviewRouter);
router.use('/stats', statsRouter);
router.use('/voucher', voucherRouter);

export default router;
