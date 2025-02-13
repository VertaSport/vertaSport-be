import { userController } from '@/controllers';

import { Router } from 'express';

const router = Router();

router.get('/private', userController.getUserProfile);

export default router;
