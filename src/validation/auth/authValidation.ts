import { ROLE } from '@/constant/allowedRoles';
import z from 'zod';

export const registerSchema = z.object({
    name: z
        .string({ message: 'Tên người dùng không được để trống!' })
        .min(3, { message: 'Tên người dùng phải có ít nhất 3 ký tự!' })
        .max(50, { message: 'Tên người dùng không được vượt quá 50 ký tự!' }),
    email: z.string({ message: 'Email là bắt buộc!' }).email({ message: 'Email không hợp lệ!' }),
    phone: z
        .string({ message: 'Số điện thoại là bắt buộc' })
        .min(6, { message: 'Số điện thoại phải có ít nhất 3 ký tự' }),
    password: z
        .string({ message: 'Mật khẩu không được để trống!' })
        .min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự!' })
        .max(20, { message: 'Mật khẩu không được dài quá 20 ký tự!' }),
    role: z.enum([ROLE.USER, ROLE.ADMIN]).default(ROLE.USER),
});
export const loginSchema = z.object({
    email: z.string({ message: 'Email là bắt buộc!' }).email({ message: 'Email không hợp lệ!' }),
    password: z
        .string({ message: 'Mật khẩu không được để trống!' })
        .min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự!' })
        .max(20, { message: 'Mật khẩu không được dài quá 20 ký tự!' }),
});

export const sendVerifySchema = z.object({
    email: z.string({ message: 'Email là bắt buộc!' }).email({ message: 'Email không hợp lệ!' }),
});
