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
    imageRefVariants: string[];
};

export type ICreateVariant = {
    image: string;
    imageRef: string;
    size: string;
    stock: number;
    color: string;
};
