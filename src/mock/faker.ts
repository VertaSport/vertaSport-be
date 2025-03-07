import { SizeEnum } from '@/constant/sizeType';
import { summary } from '@/mock/summary';
import Product from '@/models/Product';
import Variant from '@/models/Variant';
import { randomPick } from '@/utils/randomPick';

import { fa, faker } from '@faker-js/faker';

const imgs = [
    'https://product.hstatic.net/200000182297/product/10_88364b6db7ba40caa702330203f7f471_master.jpg',
    'https://product.hstatic.net/200000182297/product/23_29eb5f78757043c09dfb4c01eb39d8b5_1024x1024.jpg',
    'https://product.hstatic.net/200000182297/product/24_7b2a4e3795604e9490e8c1b2f5aee642_1024x1024.jpg',
    'https://product.hstatic.net/200000182297/product/24_f216954fa63848ffa2ccb8458599614a_1024x1024.jpg',
    'https://product.hstatic.net/200000182297/product/25_326a51c79aad44389262122d9fad9224_1024x1024.jpg',
    'https://product.hstatic.net/200000182297/product/24_43f498fed8b448f59e2378825ecc54c6_1024x1024.jpg',
    'https://product.hstatic.net/200000182297/product/knik3_9f70bb8c711f4ed09e5c69f3a02140bc_1024x1024.jpg',
    'https://product.hstatic.net/200000182297/product/22_d34194eaa8d5435983ee6a89c753da66_1024x1024.jpg',
    'https://product.hstatic.net/200000182297/product/25_552f5ea41c394dc48aec78e493c4411b_1024x1024.jpg',
    'https://product.hstatic.net/200000182297/product/34_27ef0293eb0b4e0594624354eca5655c_1024x1024.jpg',
    'https://product.hstatic.net/200000182297/product/knik3_f7a4ea27a1f048fd9cfec6a5a4863423_1024x1024.jpg',
    'https://product.hstatic.net/200000182297/product/36_4b699008f6d140e4bdf26e53d8dd5a2d_1024x1024.jpg',
    'https://product.hstatic.net/200000182297/product/35_b81db05601144ad79fd58d3ae0526037_1024x1024.jpg',
    'https://product.hstatic.net/200000182297/product/24_0a00d4603d91453cbfc4813406e377bc_1024x1024.jpg',
    'https://product.hstatic.net/200000182297/product/24_0a00d4603d91453cbfc4813406e377bc_1024x1024.jpg',
    'https://product.hstatic.net/200000182297/product/27_14be222544314843be9c27c9427c761f_1024x1024.jpg',
    'https://product.hstatic.net/200000182297/product/25_0fe8dacff8ee4be4a413b196b96beca4_1024x1024.jpg',
    'https://product.hstatic.net/200000182297/product/24_00b13f1921664c1395a4e41496025ef6_1024x1024.jpg',
];
export function createRandomSize() {
    const type = randomPick([SizeEnum.FreeSize, SizeEnum.NumericSize]);
    let value = '';
    if (type === SizeEnum.FreeSize) {
        value = faker.string.ulid();
    }
    if (type === SizeEnum.NumericSize) {
        value = faker.string.ulid();
    }
    return {
        type,
        value,
    };
}
export function createRandomColor() {
    return {
        name: faker.string.ulid(),
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
        name: faker.commerce.department() + faker.commerce.department(),
    };
}

export function createRandomProduct(sizeids: string[], colorids: string[], cateids: string[]) {
    return {
        name: faker.commerce.productName(),
        price: String(randomPick([100000, 200000, 300000, 400000, 500000])),
        summary,
        thumbnail: randomPick(imgs),
        thumbnailRef: randomPick(imgs),
        sold: randomPick([100000, 45, 55, 222, 353, 234, 5645, 234, 345, 345, 345, 2, 34, 346, 2134]),
        isDeleted: faker.datatype.boolean(),
        isHide: faker.datatype.boolean(),
        type: {
            hasColor: faker.datatype.boolean(),
            sizeType: randomPick([SizeEnum.FreeSize, SizeEnum.NumericSize]),
        },
        variants: faker.helpers.multiple(
            () => {
                return {
                    image: randomPick(imgs),
                    imageRef: randomPick(imgs),
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

export const insertOneProductWithVariants = async (
    data: {
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
    },
    type: SizeEnum,
) => {
    const variantNews = await Variant.insertMany(data.variants);
    const variantIds = variantNews.map((variant) => variant._id.toString());
    await Product.create({ ...data, variants: variantIds, type: { ...data.type, sizeType: type } });
};
