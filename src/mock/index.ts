import { SizeEnum } from '@/constant/sizeType';
import { createRandomCate, createRandomProduct, createRandomSubCate, insertOneProductWithVariants } from '@/mock/faker';
import Cart from '@/models/Cart';
import Category from '@/models/Category';
import Color from '@/models/Color';
import Product from '@/models/Product';
import Size from '@/models/Size';
import SubCategory from '@/models/SubCategory';
import User from '@/models/User';
import Variant from '@/models/Variant';

import { faker } from '@faker-js/faker';
import { Request, Response } from 'express';

export const handleInsertData = async (req: Request, res: Response) => {
    try {
        await Product.deleteMany({});
        await Category.deleteMany({});
        await SubCategory.deleteMany({});
        await Size.deleteMany({});
        await Color.deleteMany({});
        // await User.deleteMany({});
        await Cart.deleteMany({});
        await Variant.deleteMany({});

        const subCateData = faker.helpers.multiple(createRandomSubCate, { count: 10 });
        // const sizeData = faker.helpers.multiple(createRandomSize, { count: 10 });
        // const colorData = faker.helpers.multiple(createRandomColor, { count: 10 });

        const colorData = [
            { name: 'xanh', hex: '#123b7b' },
            { name: 'đỏ', hex: '#ff0000' },
            { name: 'vàng', hex: '#ffcc00' },
            { name: 'đen', hex: '#000000' },
            { name: 'trắng', hex: '#ffffff' },
            { name: 'hồng', hex: '#ff00ff' },
            { name: 'tím', hex: '#800080' },
            { name: 'xám', hex: '#808080' },
            { name: 'cam', hex: '#ff6600' },
            { name: 'nâu', hex: '#663300' },
            { name: 'xanh lá', hex: '#00ff00' },
            { name: 'xanh dương', hex: '#0000ff' },
            { name: 'xanh ngọc', hex: '#009999' },
            { name: 'xanh da trời', hex: '#00ccff' },
            { name: 'xanh lam', hex: '#3366ff' },
            { name: 'xanh lục', hex: '#339966' },
            { name: 'xanh rêu', hex: '#336633' },
        ];

        const sizeData = [
            { type: SizeEnum.FreeSize, value: 'L' },
            { type: SizeEnum.FreeSize, value: 'M' },
            { type: SizeEnum.FreeSize, value: 'S' },
            { type: SizeEnum.FreeSize, value: 'XL' },
            { type: SizeEnum.FreeSize, value: 'XXL' },
            { type: SizeEnum.NumericSize, value: '36' },
            { type: SizeEnum.NumericSize, value: '37' },
            { type: SizeEnum.NumericSize, value: '38' },
            { type: SizeEnum.NumericSize, value: '39' },
            { type: SizeEnum.NumericSize, value: '40' },
            { type: SizeEnum.NumericSize, value: '41' },
            { type: SizeEnum.NumericSize, value: '42' },
            { type: SizeEnum.NumericSize, value: '43' },
            { type: SizeEnum.NumericSize, value: '44' },
            { type: SizeEnum.NumericSize, value: '45' },
            { type: SizeEnum.NumericSize, value: '46' },
        ];

        const createdSise = await Size.insertMany(sizeData);
        const createdColor = await Color.insertMany(colorData);
        const createdSubCate = await SubCategory.insertMany(subCateData);

        const subIds = createdSubCate.map((sub) => sub._id.toString());
        const cateData = faker.helpers.multiple(() => createRandomCate(subIds), { count: 10 });
        const cateIds = (await Category.insertMany(cateData)).map((cate) => cate._id.toString());
        const sizeIdsFreeSize = createdSise
            .filter((el) => el.type === SizeEnum.FreeSize)
            .map((size) => size._id.toString());
        const sizeIdsNum = createdSise
            .filter((el) => el.type === SizeEnum.NumericSize)
            .map((size) => size._id.toString());
        const colorIds = createdColor.map((color) => color._id.toString());

        const productDataNum = faker.helpers.multiple(() => createRandomProduct(sizeIdsNum, colorIds, cateIds), {
            count: 30,
        });
        const productDataFreesize = faker.helpers.multiple(
            () => createRandomProduct(sizeIdsFreeSize, colorIds, cateIds),
            {
                count: 30,
            },
        );
        await User.create({
            email: 'admin@gmail.com',
            password: '123456',
            role: 'admin',
            name: 'Admin',
            phone: '0123456789',
            isActive: true,
        });
        await Promise.all([
            ...productDataNum.map((product) => insertOneProductWithVariants(product, SizeEnum.NumericSize)),
            ...productDataFreesize.map((product) => insertOneProductWithVariants(product, SizeEnum.FreeSize)),
        ]);
        res.status(200).json({ message: 'Insert data success' });
    } catch (error) {
        console.error('Error inserting data: ', error.message);
    }
};
