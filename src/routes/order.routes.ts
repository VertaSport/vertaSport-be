import { orderController } from '@/controllers';
import { authenticate } from '@/middlewares/authenticationMiddleware';
import { Router } from 'express';

const router = Router();

router.post('/create-order', authenticate, orderController.createOrder);
router.get('/my-orders', authenticate, orderController.getMyOrder);
router.get('/my-orders/:id', authenticate, orderController.getDetailOrder);

export default router;
