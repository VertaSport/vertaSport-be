import { cartController } from '@/controllers';
import { authenticate } from '@/middlewares/authenticationMiddleware';
import { Router } from 'express';

const router = Router();

router.post('/add', authenticate, cartController.addToCart);
router.post('/update-quantity', authenticate, cartController.updateCartItem);
router.post('/delete', authenticate, cartController.removeCartItem);
router.get('/', authenticate, cartController.getAllCart);
