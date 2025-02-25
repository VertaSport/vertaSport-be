import { ROLE } from '@/constant/allowedRoles';
import { colorController, payosController } from '@/controllers';
import { authenticate } from '@/middlewares/authenticationMiddleware';
import { authorsize } from '@/middlewares/authorizetionMiddleware';
import { Router } from 'express';

const colorRouter = Router();

colorRouter.post('/create', authenticate, payosController.createPayOsPayment);
colorRouter.post('/update-stock/cancel', authenticate, payosController.updateStockCancelOrderPayos);

colorRouter.delete('/cancel/:id', authenticate, authorsize(ROLE.ADMIN), payosController.cancelPaymentLink);

export default colorRouter;
