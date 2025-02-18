import axios from 'axios';
import config from './env.config';

const axiosInstance = axios.create({
    baseURL: config.shipping.apiEndpoint,
    headers: {
        'Content-Type': 'application/json',
        token: config.shipping.apiToken,
        shop_id: config.shipping.shopId,
    },
    withCredentials: true,
});

axiosInstance.interceptors.request.use(
    function (config) {
        return config;
    },
    function (error) {
        return Promise.reject(error);
    },
);

axiosInstance.interceptors.response.use(
    function (response) {
        return response && response.data ? response.data : response;
    },
    function (error) {
        return Promise.reject(error);
    },
);

export default axiosInstance;
