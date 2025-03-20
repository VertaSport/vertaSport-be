import mongoose from 'mongoose';

const usedVoucherSchema = new mongoose.Schema({
    voucherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('UsedVoucher', usedVoucherSchema);
