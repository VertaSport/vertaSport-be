import { ROLE } from '@/constant/allowedRoles';
import { ORDER_PAYMENT_STATUS, ORDER_STATUS, PAYMENT_METHOD } from '@/constant/order';
import { OrderSchema } from '@/interfaces/schema/order';
import mongoose, { ObjectId } from 'mongoose';
import dayjs from 'dayjs';
import { DiscountType } from '@/models/Voucher';

const OrderItemSchema = new mongoose.Schema(
    {
        productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
        variantId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Variant' },
        name: { type: String, required: true },
        size: { type: String, required: true },
        color: { type: String, required: true },
        category: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        image: { type: String, required: true },
        isReviewed: { type: Boolean, default: false },
        isReviewDisabled: { type: Boolean, default: false },
    },
    {
        _id: false,
        id: false,
        versionKey: false,
        timestamps: false,
    },
);

const StatusLogSchema = new mongoose.Schema(
    {
        status: { type: String, required: true, enum: Object.values(ORDER_STATUS) },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        updatedByName: { type: String, required: true },
        updatedByRole: { type: String, required: true, enum: Object.values(ROLE) },
        description: { type: String },
        updatedAt: { type: Date, default: Date.now },
    },
    {
        _id: false,
        id: false,
        versionKey: false,
    },
);

const orderSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        orderCode: { type: String, required: true, unique: true },
        paymentLinkId: { type: String },
        voucherDiscount: {
            type: Number,
            default: 0,
        },
        discountType: {
            type: String,
            enum: Object.values(DiscountType),
            required: true,
            default: null,
        },
        voucherName: {
            type: String,
            default: null,
        },
        voucherCode: {
            type: String,
            default: null,
        },
        items: [OrderItemSchema],
        totalPrice: { type: Number, required: true },
        shippingFee: { type: Number, default: 0 },
        customerInfo: {
            name: { type: String, required: true },
            email: { type: String, required: true },
            phone: { type: String, required: true },
        },
        shippingAddress: {
            country: { type: String, default: 'Viet Nam' },
            province: String,
            district: String,
            ward: String,
            address: String,
        },
        paymentMethod: {
            type: String,
            trim: true,
            required: true,
            enum: Object.values(PAYMENT_METHOD),
            default: PAYMENT_METHOD.CASH,
        },
        isDeleteForUser: { type: Boolean, default: false },
        isPaid: { type: Boolean, default: false },
        canceledBy: { type: String, default: 'none', enum: [...Object.values(ROLE), 'none'] },
        statusLogs: [StatusLogSchema],
        description: { type: String },
        orderStatus: {
            type: String,
            default: ORDER_STATUS.PENDING,
            enum: Object.values(ORDER_STATUS),
        },
        expiredAt: { type: Date },
        orderPaymentStatus: {
            type: String,
            default: ORDER_PAYMENT_STATUS.PENDING,
            enum: Object.values(ORDER_PAYMENT_STATUS),
        },
    },
    {
        versionKey: false,
        timestamps: true,
    },
);

orderSchema.pre('save', async function (next) {
    if (this.isNew) {
        let attempt = 0;
        const maxAttempts = 5;
        let code;

        while (attempt < maxAttempts) {
            const customerPrefix = this.customerInfo.name.substring(0, 5).toUpperCase() || 'ORDER';
            const datePart = dayjs(this.createdAt).format('YYMMDD');
            const randomString = Math.random().toString(36).substring(2, 5).toUpperCase();
            code = `ORD-${customerPrefix}-${datePart}-${randomString}`;

            const OrderModel = this.model('Order') as mongoose.Model<OrderSchema>;
            const existingOrder = await OrderModel.findOne({ orderCode: code });

            if (!existingOrder) {
                this.orderCode = code;
                break;
            }

            attempt++;
            if (attempt === maxAttempts) {
                return next(new Error('Unable to generate unique order code after multiple attempts'));
            }
        }
    }
    next();
});

export default mongoose.model<OrderSchema>('Order', orderSchema);
