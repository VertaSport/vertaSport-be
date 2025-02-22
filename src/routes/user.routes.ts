import { userController } from '@/controllers';
import { authenticate } from '@/middlewares/authenticationMiddleware';
import { Router } from 'express';

const router = Router();

router.get('/private', authenticate, userController.getProfile);
router.patch('/change-password', authenticate, userController.changePassword);

export default router;
