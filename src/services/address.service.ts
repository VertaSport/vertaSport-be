import { BadRequestError, BadRequestFormError } from '@/error/customError';
import customResponse from '@/helpers/response';
import Address from '@/models/Address';
import { NextFunction, Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

export const getAllAddressByUser = async (req: Request, res: Response, next: NextFunction) => {
    const address = await Address.find({ userId: req.userId });
    return res.status(StatusCodes.OK).json(
        customResponse({
            data: address,
            message: ReasonPhrases.OK,
            status: StatusCodes.OK,
            success: true,
        }),
    );
};
export const getDetailAddress = async (req: Request, res: Response, next: NextFunction) => {
    const address = await Address.findOne({ userId: req.userId, _id: req.params.id });
    return res.status(StatusCodes.OK).json(
        customResponse({
            data: address,
            message: ReasonPhrases.OK,
            status: StatusCodes.OK,
            success: true,
        }),
    );
};
export const createAddress = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const { default: defaultValue, type: typeValue, ...filteredBody } = req.body;
    const foundedAddress = await Address.findOne({ userId, ...filteredBody });
    if (foundedAddress) {
        throw new BadRequestError('Địa chỉ này đã tồn tại');
    }
    const addressCount = await Address.countDocuments({ userId });
    if (addressCount >= 5) {
        throw new BadRequestError('Bạn chỉ có thể thêm tối đa 5 địa chỉ');
    }
    const defaultAddress = req.body.default || addressCount === 0;
    if (defaultAddress) {
        await Address.updateMany({ userId }, { $set: { default: false } });
    }
    const newAddress = await Address.create({
        userId,
        ...req.body,
        default: defaultAddress,
    });
    return res.status(StatusCodes.OK).json(
        customResponse({
            data: newAddress,
            message: 'Thêm địa chỉ mới thành công',
            status: StatusCodes.OK,
            success: true,
        }),
    );
};

export const updateAddress = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const id = req.params.id;
    const defaultAddress = req.body.default;
    const { default: defaultValue, type: typeValue, ...filteredBody } = req.body;
    const [foundedUniqueAddress, foundedAddress] = await Promise.all([
        Address.findOne({ userId, _id: { $ne: id }, ...filteredBody }),
        Address.findById(id),
    ]);
    if (!foundedAddress) {
        throw new BadRequestError('Không tìm thấy địa chỉ');
    }
    if (foundedUniqueAddress) {
        throw new BadRequestError('Bạn không được cập nhật địa chỉ giống với 1 địa chỉ có sẵn');
    }
    if (foundedAddress.default && defaultAddress === false) {
        throw new BadRequestError('Bạn phải có 1 địa chỉ mặc định');
    }
    if (defaultAddress) {
        await Address.updateMany({ userId }, { $set: { default: false } });
    }
    const updatedAddress = await Address.findByIdAndUpdate(id, req.body, { new: true });
    return res.status(StatusCodes.OK).json(
        customResponse({
            data: updatedAddress,
            message: 'Cập nhật địa chỉ thành công',
            status: StatusCodes.OK,
            success: true,
        }),
    );
};

export const setDefaultAddress = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const id = req.params.id;
    if (!id) {
        throw new BadRequestError('Cần id của address');
    }
    const address = await Address.findOne({ userId, _id: id });
    if (!address) {
        throw new BadRequestError('Địa chỉ này không tồn tại');
    }
    if (address.default) {
        throw new BadRequestError('Địa chỉ này đã là mặc định');
    }
    await Address.updateMany({ userId }, { $set: { default: false } });
    address.default = true;
    await address.save();
    return res.status(StatusCodes.OK).json(
        customResponse({
            data: address,
            message: 'Cập nhật địa chỉ mặc định thành công',
            status: StatusCodes.OK,
            success: true,
        }),
    );
};

export const deleteAddress = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const id = req.params.id;
    if (!id) {
        throw new BadRequestError('Cần id của address');
    }
    const address = await Address.findOne({ userId, _id: id });
    if (!address) {
        throw new BadRequestError('Địa chỉ này không tồn tại');
    }
    if (address.default) {
        throw new BadRequestError('Bạn không được xóa địa chỉ mặc định');
    }
    await Address.findOneAndDelete({ userId, _id: id }, { new: true });
    return res.status(StatusCodes.OK).json(
        customResponse({
            data: address,
            message: 'Xóa địa chỉ thành công',
            status: StatusCodes.OK,
            success: true,
        }),
    );
};
