import { SizeEnum } from '@/constant/sizeType';
import Product from '@/models/Product';
import Variant from '@/models/Variant';
import { randomPick } from '@/utils/randomPick';

import { faker } from '@faker-js/faker';

export function createRandomSize() {
    const type = randomPick([SizeEnum.FreeSize, SizeEnum.NumericSize]);
    let value = '';
    if (type === SizeEnum.FreeSize) {
        value = randomPick(['S', 'M', 'L', 'XL', 'XXL']);
    }
    if (type === SizeEnum.NumericSize) {
        value = randomPick(['28', '30', '32', '34', '36']);
    }
    return {
        type,
        value,
    };
}
export function createRandomColor() {
    return {
        name: faker.internet.color(),
        hex: faker.internet.color(),
    };
}
export function createRandomCate(subids: string[]) {
    return {
        name: faker.commerce.department(),
        items: randomPick(subids),
    };
}

export function createRandomSubCate() {
    return {
        name: faker.commerce.department(),
    };
}

export function createRandomProduct(sizeids: string[], colorids: string[], cateids: string[]) {
    return {
        name: faker.commerce.productName(),
        price: faker.commerce.price(),
        summary: faker.commerce.productDescription(),
        thumbnail: faker.image.urlPicsumPhotos(),
        thumbnailRef: faker.image.urlPicsumPhotos(),
        sold: faker.number.int(),
        isDeleted: faker.datatype.boolean(),
        isHide: faker.datatype.boolean(),
        type: {
            hasColor: faker.datatype.boolean(),
            sizeType: randomPick([SizeEnum.FreeSize, SizeEnum.NumericSize]),
        },
        variants: faker.helpers.multiple(
            () => {
                return {
                    image: faker.image.urlPicsumPhotos(),
                    imageRef: faker.image.urlPicsumPhotos(),
                    size: randomPick(sizeids),
                    color: randomPick(colorids),
                    stock: randomPick([2, 10, 40, 200, 3000]),
                };
            },
            {
                count: 5,
            },
        ),
        categories: randomPick(cateids),
        filterSize: randomPick(sizeids),
        filterColor: randomPick(colorids),
    };
}

export const insertOneProductWithVariants = async (data: {
    name: string;
    price: string;
    summary: string;
    thumbnail: string;
    thumbnailRef: string;
    sold: number;
    isDeleted: boolean;
    isHide: boolean;
    type: {
        hasColor: boolean;
        sizeType: SizeEnum;
    };
    variants: {
        image: string;
        imageRef: string;
        size: string;
        color: string;
        stock: number;
    }[];
    categories: string;
    filterSize: string;
    filterColor: string;
}) => {
    const variantNews = await Variant.insertMany(data.variants);
    const variantIds = variantNews.map((variant) => variant._id.toString());
    await Product.create({ ...data, variants: variantIds });
};
