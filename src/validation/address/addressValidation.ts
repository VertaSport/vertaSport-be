import z from 'zod';

export const addressSchema = z.object({
    name: z.string({ message: 'Tên người nhận là bắt buộc' }).min(3, { message: 'Tên người nhận tối thiểu 3 ký tự' }),
    phone: z.string({ message: 'Số điện thoại là bắt buộc' }).min(8, { message: 'Số điện thoại tối thiểu 8 ký tự' }),
    province: z.string({ message: 'Tỉnh/Thành phố là bắt buộc' }),
    district: z.string({ message: 'Quận/Huyện là bắt buộc' }),
    ward: z.string({ message: 'Phường/Xã là bắt buộc' }),
    address: z.string({ message: 'Địa chỉ chi tiết là bắt buộc' }),
    provinceId: z.number().optional(),
    districtId: z.number().optional(),
    default: z.boolean().optional(),
    type: z.string().optional(),
});
