import { cateController } from '@/controllers';
import { Router } from 'express';

const cateRouter = Router();

cateRouter.post('/', cateController.createCate);
cateRouter.get('/', cateController.getAllCate);
cateRouter.patch('/:cateId', cateController.updateCategory);

export default cateRouter;
