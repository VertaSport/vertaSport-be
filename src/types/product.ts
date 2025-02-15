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
    items: { image: string; imageRef: string; size: string; stock: number; sold: number }[];
    color: string;
};
