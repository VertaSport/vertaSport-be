import { SizeEnum } from '@/constant/sizeType';

export type ICreateProduct = {
    name: string;
    price: number;
    thumbnail: string;
    thumbnailRef: string;
    summary: string;
    isDeleted?: boolean;
    isHide?: boolean;
    type: { hasColor: boolean; sizeType: SizeEnum };
    variants: string[];
    categories: string[];
    filterSize: string[];
    filterColor: string[];
};

export type ICreateVariant = {
    image: string;
    imageRef: string;
    size: string;
    stock: number;
    color: string;
};

export type IProductDetailsForUpdateHandler = {
    name: string;
    price: number;
    summary: string;
    categories: string;
    sizeType: SizeEnum;
    thumbnail: Array<{
        uid: string;
        name: string;
        status: string;
        url: string;
    }>;
    variants: Array<{
        color: string;
        image: Array<{
            uid: string;
            name: string;
            status: string;
            url: string;
        }>;
        properties: Array<{
            size: string;
            stock: number;
            _id: string;
        }>;
    }>;
};
