import { productController } from '@/controllers';
import { Router } from 'express';

const productRouter = Router();

productRouter.post('/', productController.createProduct);
productRouter.post('/variant', productController.createVariant);
productRouter.get('/', productController.getAllProductsClient);

export default productRouter;
