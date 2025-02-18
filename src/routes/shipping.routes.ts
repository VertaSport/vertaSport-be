import { shippingController } from '@/controllers';
import { Router } from 'express';

const router = Router();

router.get('/get-province', shippingController.getProvince);
router.get('/get-district', shippingController.getDistrict);
router.get('/get-ward', shippingController.getWard);

export default router;
