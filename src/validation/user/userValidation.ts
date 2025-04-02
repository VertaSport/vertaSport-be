import z from 'zod';

export const changePasswoordSchema = z.object({
    oldPassword: z
        .string({ message: 'Mật khẩu cũ là bắt buộc' })
        .min(6, { message: 'Mật khẩu cũ phải có tối thiểu 6 ký tự' }),
    newPassword: z
        .string({ message: 'Mật khẩu mới là bắt buộc' })
        .min(6, { message: 'Mật khẩu mới phải có tối thiểu 6 ký tự' }),
});

export const banUserSchema = z.object({
    userId: z.string().min(1, 'User ID là bắt buộc'),
    reason: z.string().min(5, 'Lý do khóa phải có ít nhất 5 ký tự'),
});

export const unbanUserSchema = z.object({
    userId: z.string().min(1, 'User ID là bắt buộc'),
});
