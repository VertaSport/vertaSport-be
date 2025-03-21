import { userController } from '@/controllers';
import { authenticate } from '@/middlewares/authenticationMiddleware';
import { changePasswoordSchema } from '@/validation/user/userValidation';
import validator from '@/validation/validator';
import { Router } from 'express';

const router = Router();

router.get('/private', authenticate, userController.getProfile);
router.patch('/change-password', authenticate, validator(changePasswoordSchema), userController.changePassword);
router.put('/update', authenticate, userController.updateUser);

export default router;
