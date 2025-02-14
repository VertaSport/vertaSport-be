import { ROLE } from '@/constant/allowedRoles';
import { Document } from 'mongoose';

export interface IUserSchema extends Document {
    name: string;
    email: string;
    password: string;
    isActive: boolean;
    avatar: string;
    avatarRef: string;
    phone: string;
    role: ROLE;
}
