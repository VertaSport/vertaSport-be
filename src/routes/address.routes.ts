import { addressController } from '@/controllers';
import { authenticate } from '@/middlewares/authenticationMiddleware';
import { addressSchema } from '@/validation/address/addressValidation';
import validator from '@/validation/validator';
import { Router } from 'express';

const router = Router();

router.get('/all', authenticate, addressController.getAllAddressByUser);
router.get('/:id', authenticate, addressController.getDetailAddress);
router.post('/create', authenticate, validator(addressSchema), addressController.createAddress);
router.patch('/change-default/:id', authenticate, addressController.setDefaultAddress);
router.delete('/delete/:id', authenticate, addressController.deleteAddress);
router.patch('/update/:id', authenticate, validator(addressSchema), addressController.updateAddress);

export default router;
