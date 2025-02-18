import { Request, Response } from 'express';
import request from '@/config/axios.config';
import config from '@/config/env.config';
import { ENDPOINT } from '@/constant/endPoints';
import { HTTP_METHOD } from '@/constant/http';

export const getProvince = async (req: Request, res: Response) => {
    const response: any = await request({
        method: HTTP_METHOD.GET,
        url: ENDPOINT.GET_PROVINCE,
    });
    const filteredResponse = response.data.filter((item) => item.ProvinceName !== 'Test');
    const newResponse = {
        data: [...filteredResponse],
        success: true,
    };
    return newResponse;
};

export const getDistrict = async (req: Request, res: Response) => {
    try {
        const response = await request({
            method: HTTP_METHOD.GET,
            url: ENDPOINT.GET_DISTRICT,
            data: {
                province_id: JSON.parse(req.query.provinceId as string),
            },
        });
        return response;
    } catch (error) {
        console.log(error);
    }
};

export const getWard = async (req: Request, res: Response) => {
    try {
        const response = await request({
            method: HTTP_METHOD.GET,
            url: ENDPOINT.GET_WARD,
            params: {
                district_id: JSON.parse(req.query.districtId as string),
            },
        });
        return response;
    } catch (error) {
        console.log(error);
    }
};
