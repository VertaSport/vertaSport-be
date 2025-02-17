import {
    createRandomCate,
    createRandomColor,
    createRandomProduct,
    createRandomSize,
    createRandomSubCate,
    insertOneProductWithVariants,
} from '@/mock/faker';
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
        await User.deleteMany({});
        await Cart.deleteMany({});
        await Variant.deleteMany({});

        const subCateData = faker.helpers.multiple(createRandomSubCate, { count: 10 });
        const sizeData = faker.helpers.multiple(createRandomSize, { count: 10 });
        const colorData = faker.helpers.multiple(createRandomColor, { count: 10 });

        const createdSise = await Size.insertMany(sizeData);
        const createdColor = await Color.insertMany(colorData);
        const createdSubCate = await SubCategory.insertMany(subCateData);

        const subIds = createdSubCate.map((sub) => sub._id.toString());
        const cateData = faker.helpers.multiple(() => createRandomCate(subIds), { count: 10 });
        const cateIds = (await Category.insertMany(cateData)).map((cate) => cate._id.toString());
        const sizeIds = createdSise.map((size) => size._id.toString());
        const colorIds = createdColor.map((color) => color._id.toString());

        const productData = faker.helpers.multiple(() => createRandomProduct(sizeIds, colorIds, cateIds), {
            count: 60,
        });
        await Promise.all(productData.map((product) => insertOneProductWithVariants(product)));
        res.status(200).json({ message: 'Insert data success' });
    } catch (error) {
        console.error('Error inserting data: ', error.message);
    }
};
