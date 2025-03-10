import { orderController } from '@/controllers';
import { authenticate } from '@/middlewares/authenticationMiddleware';
import { Router } from 'express';

const router = Router();

router.post('/create-order', authenticate, orderController.createOrder);
router.get('/my-orders', authenticate, orderController.getMyOrder);
router.get('/my-orders/:id', authenticate, orderController.getDetailOrder);
router.get('/all', authenticate, orderController.getAllOrders);
router.get('/history/:id', authenticate, orderController.getHistory);

router.patch('/cancel', authenticate, orderController.cancelOrder);
router.patch('/confirm', authenticate, orderController.confirmOrder);
router.patch('/shipping', authenticate, orderController.shippingOrder);
router.patch('/done', authenticate, orderController.finishOrder);
router.patch('/delivered', authenticate, orderController.deliverOrder);

export default router;
