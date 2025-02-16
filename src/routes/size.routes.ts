import { sizeController } from '@/controllers';
import { Router } from 'express';

const sizeRouter = Router();

sizeRouter.post('/', sizeController.createSize);
sizeRouter.get('/', sizeController.getAllSize);
sizeRouter.put('/', sizeController.updateSize);

export default sizeRouter;
