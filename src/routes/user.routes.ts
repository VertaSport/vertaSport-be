import { ROLE } from '@/constant/role';
import { userController } from '@/controllers';
import { authenticate } from '@/middlewares/authenticationMiddleware';
import { authorsize } from '@/middlewares/authorizetionMiddleware';
import { changePasswoordSchema, banUserSchema, unbanUserSchema } from '@/validation/user/userValidation';
import validator from '@/validation/validator';
import { Router } from 'express';

const router = Router();

router.get('/private', authenticate, userController.getProfile);
router.get('/all', authenticate, authorsize(ROLE.ADMIN), userController.getAllUsers);
router.patch('/change-password', authenticate, validator(changePasswoordSchema), userController.changePassword);
router.put('/update', authenticate, userController.updateUser);
router.patch('/ban', authenticate, authorsize(ROLE.ADMIN), validator(banUserSchema), userController.banUser);
router.patch('/unban', authenticate, authorsize(ROLE.ADMIN), validator(unbanUserSchema), userController.unbanUser);
router.get('/ban-history', authenticate, authorsize(ROLE.ADMIN), userController.getUserBanHistory);

export default router;
