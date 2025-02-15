import APIQuery, { QueryString } from '@/helpers/apiQuery';
import Product from '@/models/Product';
import { Request, Response } from 'express';
import { Document, Query } from 'mongoose';

export const create = async (dto: any) => {
    const product = new Product(dto);
    await product.save();
    return product;
};
export const update = async (id: string, dto: any) => {
    const product = await Product.findByIdAndUpdate(id, dto);
    return product;
};

export const getAll = async (query: Query<Document[], Document>, queryString: QueryString) => {
    const features = new APIQuery(query, queryString);
    features.filter().sort().limitFields().search().paginate();
    const [data, totalDocs] = await Promise.all([features.query, features.count()]);
    return {
        data,
        totalDocs,
    };
};
