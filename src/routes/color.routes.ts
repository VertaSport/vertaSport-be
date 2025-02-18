import { colorController } from '@/controllers';
import { Router } from 'express';

const colorRouter = Router();

colorRouter.post('/', colorController.createColor);
colorRouter.get('/all', colorController.getAllColor);
colorRouter.get('/:id', colorController.getDetailedColor);
colorRouter.patch('/:id', colorController.updateColor);

export default colorRouter;
