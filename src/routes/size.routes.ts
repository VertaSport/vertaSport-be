import { sizeController } from '@/controllers';
import { Router } from 'express';

const sizeRouter = Router();

sizeRouter.post('/', sizeController.createSize);
sizeRouter.get('/all', sizeController.getAllSize);
sizeRouter.get('/:id', sizeController.getDetailedSize);
sizeRouter.patch('/:id', sizeController.updateSize);

export default sizeRouter;
