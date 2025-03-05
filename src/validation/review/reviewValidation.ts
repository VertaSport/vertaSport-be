import z from 'zod';

export const reviewSchema = z.object({
    productId: z.string({ message: 'Product ID là bắt buộc' }),
    orderId: z.string({ message: 'Order ID là bắt buộc' }),
    variantId: z.string({ message: 'Variant ID là bắt buộc' }),
    rating: z
        .number({ message: 'Rating là bắt buộc' })
        .min(1, { message: 'Rating phải lớn hơn hoặc bằng 1' })
        .max(5, { message: 'Rating phải nhỏ hơn hoặc bằng 5' }),
    content: z.string().optional(),
});
