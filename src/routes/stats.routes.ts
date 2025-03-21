import { Router } from 'express';
import { authenticate } from '../middlewares/authenticationMiddleware';
import { authorsize } from '../middlewares/authorizetionMiddleware';
import { ROLE } from '../constant/role';
import { statsController } from '@/controllers';

const router = Router();

router.get('/total', authenticate, authorsize(ROLE.ADMIN), statsController.totalStats);
router.get('/pending-task', authenticate, authorsize(ROLE.ADMIN), statsController.pendingTask);
router.get('/dateRange', authenticate, authorsize(ROLE.ADMIN), statsController.orderByDateRangeStats);
router.get('/productStats', authenticate, authorsize(ROLE.ADMIN), statsController.getProductStats);
router.get('/topBuyers', authenticate, authorsize(ROLE.ADMIN), statsController.getTop5Buyers);
export default router;
