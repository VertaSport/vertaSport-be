import { authController, uploadController } from '@/controllers';
import upload from '@/middlewares/multerMiddleware';
import { Router } from 'express';

const uploadRouter = Router();

uploadRouter.post('/image', upload.single('image'), uploadController.uploadImage);
uploadRouter.post('/images', upload.fields([{ name: 'images', maxCount: 5 }]), uploadController.uploadImages);

export default uploadRouter;
