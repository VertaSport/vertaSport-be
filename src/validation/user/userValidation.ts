import z from 'zod';

export const changePasswoordSchema = z.object({
    oldPassword: z
        .string({ message: 'Mật khẩu cũ là bắt buộc' })
        .min(6, { message: 'Mật khẩu cũ phải có tối thiểu 6 ký tự' }),
    newPassword: z
        .string({ message: 'Mật khẩu mới là bắt buộc' })
        .min(6, { message: 'Mật khẩu mới phải có tối thiểu 6 ký tự' }),
});
