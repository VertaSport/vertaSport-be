import { authenticate } from '@/middlewares/authenticationMiddleware';
import { Router } from 'express';
import {
    createVoucher,
    updateVoucher,
    updateVoucherStatus,
    getAllVoucher,
    getVoucherForNewUser,
    getAllVoucherForAdmin,
    getVoucherDetails,
} from '@/controllers/voucher.controller';

const voucherRouter = Router();

voucherRouter.post('/create', authenticate, createVoucher);
voucherRouter.put('/update/:id', authenticate, updateVoucher);
voucherRouter.get('/details/:id', authenticate, getVoucherDetails);
voucherRouter.patch('/update-status/:id', authenticate, updateVoucherStatus);
voucherRouter.get('/all', authenticate, getAllVoucher);
voucherRouter.get('/new-user', authenticate, getVoucherForNewUser);
voucherRouter.get('/admin/all', authenticate, getAllVoucherForAdmin);

export default voucherRouter;
