import { colorController } from '@/controllers';
import { Router } from 'express';

const colorRouter = Router();

colorRouter.post('/', colorController.createColor);
colorRouter.get('/', colorController.getAllColor);
colorRouter.put('/', colorController.updateColor);

export default colorRouter;
