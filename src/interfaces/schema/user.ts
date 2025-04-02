import { Document, Types } from 'mongoose';

export interface IUserSchema extends Document {
    name: string;
    email: string;
    password: string;
    isActive: boolean;
    avatar: string;
    avatarRef?: string;
    phone?: string;
    role: string;
    userIsOldWhen: Date;
    createdAt: Date;
    updatedAt: Date;
    isBanned: boolean;
    bannedReason?: string;
    bannedAt?: Date;
    banHistory: {
        action: 'ban' | 'unban';
        adminId: Types.ObjectId;
        adminName: string;
        adminEmail: string;
        reason?: string;
        timestamp: Date;
    }[];
}
