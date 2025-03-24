import { ROLE } from '@/constant/role';
import { userController } from '@/controllers';
import { authenticate } from '@/middlewares/authenticationMiddleware';
import { authorsize } from '@/middlewares/authorizetionMiddleware';
import { changePasswoordSchema } from '@/validation/user/userValidation';
import validator from '@/validation/validator';
import { Router } from 'express';

const router = Router();

router.get('/private', authenticate, userController.getProfile);
router.get('/all', authenticate, authorsize(ROLE.ADMIN), userController.getAllUsers);
router.patch('/change-password', authenticate, validator(changePasswoordSchema), userController.changePassword);
router.put('/update', authenticate, userController.updateUser);

export default router;
