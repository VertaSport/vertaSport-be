import { ROLE } from '@/constant/allowedRoles';
import { reviewController } from '@/controllers';
import { authenticate } from '@/middlewares/authenticationMiddleware';
import { authorsize } from '@/middlewares/authorizetionMiddleware';
import { reviewSchema } from '@/validation/review/reviewValidation';
import validator from '@/validation/validator';
import { Router } from 'express';

const router = Router();

router.post('/create', authenticate, validator(reviewSchema), reviewController.createReview);

router.get('/all', authenticate, authorsize(ROLE.ADMIN), reviewController.getAllReviews);
router.get('/rating/:productId', reviewController.useGetAllReviewStar);
router.post('/hidden/:reviewId', reviewController.hiddenReview);
router.post('/active/:reviewId', reviewController.activeReview);
router.get('/:productId', reviewController.getALlReviewsProduct);

export default router;
