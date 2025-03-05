import { reviewController } from '@/controllers';
import { authenticate } from '@/middlewares/authenticationMiddleware';
import { reviewSchema } from '@/validation/review/reviewValidation';
import validator from '@/validation/validator';
import { Router } from 'express';

const router = Router();

router.post('/create', authenticate, validator(reviewSchema), reviewController.createReview);

router.get('/rating/:productId', reviewController.useGetAllReviewStar);
router.get('/:productId', reviewController.getALlReviewsProduct);

export default router;
