import { ROLE } from '@/constant/allowedRoles';
import { productController } from '@/controllers';
import { authenticate } from '@/middlewares/authenticationMiddleware';
import { authorsize } from '@/middlewares/authorizetionMiddleware';
import { Router } from 'express';

const productRouter = Router();

// productRouter.get('/admin', authenticate, authorsize(ROLE.ADMIN), productController.getAllProductsAdmin);

productRouter.get('/admin/product-details/:id', productController.getProductDetailsForAdminUpdate);
productRouter.get('/admin', productController.getAllProductsAdmin);
productRouter.get('/:id', productController.getProductDetails);
productRouter.post('/', productController.createProduct);
productRouter.get('/', productController.getAllProductsClient);
productRouter.post('/variant', productController.createVariant);
productRouter.get('/best-selling', productController.Top10BestSelling);
productRouter.get('/newest', productController.get10Newest);
productRouter.get('/related/:categoryId', productController.getProductRelated);
productRouter.patch('/update/:idPro', productController.updateProduct);

export default productRouter;
