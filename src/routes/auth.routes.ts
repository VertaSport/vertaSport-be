import { authController } from '@/controllers';
import rateLimitMiddleware from '@/middlewares/limiterResquestMiddleware';
import { loginSchema, registerSchema, sendVerifySchema } from '@/validation/auth/authValidation';
import validator from '@/validation/validator';
import { Router } from 'express';

const router = Router();

router.post('/register', validator(registerSchema), authController.register);
router.post('/login', validator(loginSchema), authController.login);
router.post('/sendVerify', rateLimitMiddleware(30, 1), validator(sendVerifySchema), authController.sendVerify);
router.post('/verify', authController.verifyAccount);

export default router;
