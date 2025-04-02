import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLE } from '@/constant/allowedRoles';
import { IUserSchema } from '@/interfaces/schema/user';

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        isActive: {
            type: Boolean,
            default: false,
        },
        avatar: {
            type: String,
            default:
                'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg',
        },
        avatarRef: {
            type: String,
        },
        phone: {
            type: String,
            trim: true,
        },
        role: {
            type: String,
            default: ROLE.USER,
            enum: [ROLE.USER, ROLE.ADMIN],
        },
        userIsOldWhen: {
            type: Date,
            default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
        },
        isBanned: {
            type: Boolean,
            default: false,
        },
        bannedReason: {
            type: String,
            default: null,
        },
        bannedAt: {
            type: Date,
            default: null,
        },
        banHistory: [
            {
                action: {
                    type: String,
                    enum: ['ban', 'unban'],
                    required: true,
                },
                adminId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                adminName: {
                    type: String,
                    required: true,
                },
                adminEmail: {
                    type: String,
                    required: true,
                },
                reason: {
                    type: String,
                    default: null,
                },
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

UserSchema.pre('save', async function (next) {
    if (this.isNew || this.isModified('password')) {
        await mongoose.model('Cart').create({ userId: this._id });
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
    }
    next();
});

UserSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

const User = mongoose.model<IUserSchema>('User', UserSchema);

export default User;
