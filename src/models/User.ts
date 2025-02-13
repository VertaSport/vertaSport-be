import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLE } from '@/constant/allowedRoles';

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
            enum: [ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN],
        },
        wishList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: [] }],
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

const User = mongoose.model('User', UserSchema);

export default User;
