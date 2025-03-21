import { Request, Response, NextFunction } from 'express';
import Order from '../models/Order';
import User from '../models/User';
import Product from '../models/Product';
import moment from 'moment-timezone';
import { ORDER_STATUS } from '@/constant/order';
import {
    DashboardStatsResponse,
    OrderByDateRangeStat,
    ProductStat,
    ProductStatsQuery,
    ProductStatsResponse,
    TopBuyersResponse,
} from '@/types/stats';
import { StatusCodes } from 'http-status-codes';

interface TotalStatsResponse {
    totalOrders: number;
    cancelledOrders: number;
    successfulOrders: number;
    totalRevenue: number;
    orderSuccessRate: number;
    orderCancelRate: number;
    newUsers: number;
    newProducts: number;
    averageDailyRevenue: number;
    dateRange: {
        start: string;
        end: string;
    };
}

export const totalStats = async (req: any, res: Response, next: NextFunction) => {
    const { dateFilter, startDate, endDate, month, year } = req.query;

    const vietnamTZ = 'Asia/Ho_Chi_Minh';
    let start: Date, end: Date;

    if (dateFilter === 'range' && startDate && endDate) {
        start = moment.tz(startDate, 'DD-MM-YYYY', vietnamTZ).startOf('day').toDate();
        end = moment.tz(endDate, 'DD-MM-YYYY', vietnamTZ).endOf('day').toDate();
    } else if (dateFilter === 'monthly' && month && year) {
        start = moment.tz(`01-${month}-${year}`, 'DD-MM-YYYY', vietnamTZ).startOf('month').toDate();
        end = moment.tz(`01-${month}-${year}`, 'DD-MM-YYYY', vietnamTZ).endOf('month').toDate();
    } else if (dateFilter === 'yearly' && year) {
        start = moment.tz(`01-01-${year}`, 'DD-MM-YYYY', vietnamTZ).startOf('year').toDate();
        end = moment.tz(`31-12-${year}`, 'DD-MM-YYYY', vietnamTZ).endOf('year').toDate();
    } else if (dateFilter === 'single' && startDate) {
        start = moment.tz(startDate, 'DD-MM-YYYY', vietnamTZ).startOf('day').toDate();
        end = moment.tz(startDate, 'DD-MM-YYYY', vietnamTZ).endOf('day').toDate();
    } else {
        return res.status(400).json({ message: 'Invalid date filter or missing parameters' });
    }

    const [totalOrders, cancelledOrders, totalRevenueResult, newUsers, newProducts] = await Promise.all([
        Order.countDocuments({
            createdAt: {
                $gte: start,
                $lte: end,
            },
        }),
        Order.countDocuments({
            createdAt: {
                $gte: start,
                $lte: end,
            },
            orderStatus: ORDER_STATUS.CANCELLED,
        }),
        Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: start,
                        $lte: end,
                    },
                    orderStatus: ORDER_STATUS.DONE,
                    isPaid: true,
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalPrice' },
                    count: { $sum: 1 },
                },
            },
        ]).then((result) => ({
            total: result[0]?.total || 0,
            count: result[0]?.count || 0,
        })),
        User.countDocuments({
            createdAt: {
                $gte: start,
                $lte: end,
            },
        }),
        Product.countDocuments({
            createdAt: {
                $gte: start,
                $lte: end,
            },
        }),
    ]);

    const successfulOrders = totalRevenueResult.count;

    const orderSuccessRate = totalOrders > 0 ? (successfulOrders / totalOrders) * 100 : 0;
    const orderCancelRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;

    const daysDiff = moment(end).diff(moment(start), 'days') + 1;
    const averageDailyRevenue = totalRevenueResult.total / daysDiff;

    const response: TotalStatsResponse = {
        totalOrders,
        cancelledOrders,
        successfulOrders,
        totalRevenue: totalRevenueResult.total,
        orderSuccessRate: parseFloat(orderSuccessRate.toFixed(2)),
        orderCancelRate: parseFloat(orderCancelRate.toFixed(2)),
        newUsers,
        newProducts,
        averageDailyRevenue: parseFloat(averageDailyRevenue.toFixed(2)),
        dateRange: {
            start: moment(start).format('YYYY-MM-DD'),
            end: moment(end).format('YYYY-MM-DD'),
        },
    };

    return { data: response };
};

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    const [pendingOrders, confirmedOrders, shippingOrders, cancelledOrders, outOfStockProducts] = await Promise.all([
        Order.countDocuments({
            $or: [{ orderStatus: ORDER_STATUS.PENDING }],
            isDeleteForUser: false,
        }),
        Order.countDocuments({
            orderStatus: ORDER_STATUS.CONFIRMED,
            isDeleteForUser: false,
        }),
        Order.countDocuments({
            orderStatus: ORDER_STATUS.SHIPPING,
            isDeleteForUser: false,
        }),
        Order.countDocuments({
            orderStatus: ORDER_STATUS.CANCELLED,
            isDeleteForUser: false,
        }),
        Product.countDocuments({
            isHide: true,
            isDeleted: false,
        }),
        Product.aggregate([
            {
                $lookup: {
                    from: 'variants',
                    localField: 'variants',
                    foreignField: '_id',
                    as: 'variantDetails',
                },
            },
            {
                $match: {
                    isDeleted: false,
                    isHide: false,
                },
            },
            {
                $addFields: {
                    totalStock: { $sum: '$variantDetails.stock' },
                },
            },
            {
                $match: {
                    totalStock: 0,
                },
            },
            {
                $count: 'outOfStockCount',
            },
        ]).then((result) => result[0]?.outOfStockCount || 0),
    ]);

    const response: DashboardStatsResponse = {
        pendingOrders,
        confirmedOrders,
        shippingOrders,
        cancelledOrders,
        outOfStockProducts,
    };

    return { data: response };
};

export const orderByDateRangeStats = async (req: any, res: Response, next: NextFunction) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Missing startDate or endDate' });
    }

    const vietnamTZ = 'Asia/Ho_Chi_Minh';

    const start = moment.tz(startDate, 'DD-MM-YYYY', vietnamTZ).startOf('day').toDate();
    const end = moment.tz(endDate, 'DD-MM-YYYY', vietnamTZ).endOf('day').toDate();

    if (!moment(start).isValid() || !moment(end).isValid() || moment(start).isAfter(end)) {
        return res.status(400).json({ message: 'Invalid date range' });
    }

    const pipeline: any = [
        {
            $match: {
                createdAt: { $gte: start, $lte: end },
                orderStatus: { $ne: ORDER_STATUS.CANCELLED },
                isPaid: true,
            },
        },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: '%Y-%m-%d',
                        date: '$createdAt',
                        timezone: vietnamTZ,
                    },
                },
                totalOrders: { $sum: 1 },
                totalRevenue: {
                    $sum: {
                        $cond: [{ $eq: ['$orderStatus', ORDER_STATUS.DONE] }, '$totalPrice', 0],
                    },
                },
            },
        },
        {
            $project: {
                _id: 0,
                date: '$_id',
                totalOrders: 1,
                totalRevenue: 1,
            },
        },
        { $sort: { date: 1 } },
    ];

    const data = await Order.aggregate(pipeline);

    const allDates: OrderByDateRangeStat[] = [];
    const currentDate = moment(start).tz(vietnamTZ);
    const lastDate = moment(end).tz(vietnamTZ);

    while (currentDate <= lastDate) {
        const dateString = currentDate.format('YYYY-MM-DD');
        const existingStat = data.find((s) => s.date === dateString) || {
            totalOrders: 0,
            totalRevenue: 0,
        };

        allDates.push({
            date: dateString,
            totalOrders: existingStat.totalOrders,
            totalRevenue: parseFloat(existingStat.totalRevenue.toFixed(2)),
        });

        currentDate.add(1, 'days');
    }

    return allDates;
};
export const getProductStats = async (req: any, res: Response, next: NextFunction) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Missing startDate or endDate' });
    }

    const vietnamTZ = 'Asia/Ho_Chi_Minh';

    const start = moment.tz(startDate, 'DD-MM-YYYY', vietnamTZ).startOf('day').toDate();
    const end = moment.tz(endDate, 'DD-MM-YYYY', vietnamTZ).endOf('day').toDate();

    if (!moment(start).isValid() || !moment(end).isValid() || moment(start).isAfter(end)) {
        return res.status(400).json({ message: 'Invalid date range' });
    }

    const pipeline: any = [
        {
            $match: {
                createdAt: { $gte: start, $lte: end },
                orderStatus: ORDER_STATUS.DONE,
                isPaid: true,
            },
        },
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.productId',
                name: { $first: '$items.name' },
                totalQuantity: { $sum: '$items.quantity' },
                totalRevenue: {
                    $sum: { $multiply: ['$items.quantity', '$items.price'] },
                },
                image: { $first: '$items.image' },
                price: { $first: '$items.price' },
            },
        },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'productDetails',
            },
        },
        {
            $unwind: '$productDetails',
        },
        {
            $lookup: {
                from: 'variants',
                localField: 'productDetails.variants',
                foreignField: '_id',
                as: 'variantDetails',
            },
        },
        {
            $addFields: {
                productTotalStock: { $sum: '$variantDetails.stock' },
            },
        },
        { $sort: { totalQuantity: -1 } },
    ];

    const allProductStats = await Order.aggregate(pipeline);

    const totalStock = await Product.aggregate([
        {
            $match: {
                isDeleted: false,
            },
        },
        {
            $lookup: {
                from: 'variants',
                localField: 'variants',
                foreignField: '_id',
                as: 'variantDetails',
            },
        },
        {
            $unwind: '$variantDetails',
        },
        {
            $group: {
                _id: null,
                totalStock: { $sum: '$variantDetails.stock' },
            },
        },
    ]);

    const totalStockValue = totalStock[0]?.totalStock || 0;

    const formatProductStats = (products: any[]): ProductStat[] => {
        return products.map((product) => ({
            _id: product._id.toString(),
            name: product.name,
            totalQuantity: product.totalQuantity,
            totalRevenue: parseFloat(product.totalRevenue.toFixed(2)),
            image: product.image,
            price: product.price,
            percentageOfTotal: (
                (product.totalQuantity / (product.totalQuantity + (product.productTotalStock || 0))) *
                100
            ).toFixed(2),
            percentageOfAllProducts:
                totalStockValue > 0 ? ((product.productTotalStock / totalStockValue) * 100).toFixed(2) : '0.00',
        }));
    };

    const topSellingProducts = allProductStats.slice(0, 5);
    const leastSellingProducts = allProductStats.slice(-5).reverse();

    const topSellingWithPercentage = formatProductStats(topSellingProducts);
    const leastSellingWithPercentage = formatProductStats(leastSellingProducts);

    const response: ProductStatsResponse = {
        topSellingProducts: topSellingWithPercentage,
        leastSellingProducts: leastSellingWithPercentage,
        dateRange: {
            start: moment(start).format('YYYY-MM-DD'),
            end: moment(end).format('YYYY-MM-DD'),
        },
    };

    return { data: response };
};
export const findTop5Buyers = async (req: any, res: Response, next: NextFunction) => {
    const { dateFilter, startDate, endDate, month, year } = req.query;

    const vietnamTZ = 'Asia/Ho_Chi_Minh';
    let start: Date, end: Date;

    if (dateFilter === 'range' && startDate && endDate) {
        start = moment.tz(startDate, 'DD-MM-YYYY', vietnamTZ).startOf('day').toDate();
        end = moment.tz(endDate, 'DD-MM-YYYY', vietnamTZ).endOf('day').toDate();
    } else if (dateFilter === 'monthly' && month && year) {
        start = moment.tz(`01-${month}-${year}`, 'DD-MM-YYYY', vietnamTZ).startOf('month').toDate();
        end = moment.tz(`01-${month}-${year}`, 'DD-MM-YYYY', vietnamTZ).endOf('month').toDate();
    } else if (dateFilter === 'yearly' && year) {
        start = moment.tz(`01-01-${year}`, 'DD-MM-YYYY', vietnamTZ).startOf('year').toDate();
        end = moment.tz(`31-12-${year}`, 'DD-MM-YYYY', vietnamTZ).endOf('year').toDate();
    } else {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid date filter' });
    }

    if (!moment(start).isValid() || !moment(end).isValid() || moment(start).isAfter(end)) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid date range' });
    }

    const topBuyersPipeline: any = [
        {
            $match: {
                createdAt: { $gte: start, $lte: end },
                orderStatus: ORDER_STATUS.DONE,
                isPaid: true,
            },
        },
        {
            $group: {
                _id: '$userId',
                totalOrders: { $sum: 1 },
                totalSpent: { $sum: '$totalPrice' },
                totalItems: { $sum: { $sum: '$items.quantity' } },
                lastOrderDate: { $max: '$createdAt' },
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'userInfo',
            },
        },
        {
            $unwind: '$userInfo',
        },
        {
            $project: {
                _id: 1,
                totalOrders: 1,
                totalSpent: 1,
                totalItems: 1,
                lastOrderDate: {
                    $dateToString: {
                        format: '%Y-%m-%d %H:%M:%S',
                        date: '$lastOrderDate',
                        timezone: vietnamTZ,
                    },
                },
                name: '$userInfo.name',
                email: '$userInfo.email',
                phone: '$userInfo.phone',
                avatar: '$userInfo.avatar',
            },
        },
        {
            $sort: { totalSpent: -1 },
        },
        {
            $limit: 5,
        },
    ];

    const latestOrdersPipeline: any = [
        {
            $match: {
                createdAt: { $gte: start, $lte: end },
            },
        },
        {
            $sort: { createdAt: -1 },
        },
        {
            $limit: 2,
        },
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'userInfo',
            },
        },
        {
            $unwind: '$userInfo',
        },
        {
            $project: {
                _id: 1,
                customerName: '$userInfo.name',
                customerAvatar: '$userInfo.avatar',
                paymentMethod: 1,
                totalPrice: 1,
                orderStatus: 1,
                createdAt: {
                    $dateToString: {
                        format: '%Y-%m-%d %H:%M:%S',
                        date: '$createdAt',
                        timezone: vietnamTZ,
                    },
                },
            },
        },
    ];

    const [topBuyers, latestOrders] = await Promise.all([
        Order.aggregate(topBuyersPipeline),
        Order.aggregate(latestOrdersPipeline),
    ]);

    const response: TopBuyersResponse = {
        topBuyers,
        latestOrders,
        dateRange: {
            start: moment(start).format('YYYY-MM-DD'),
            end: moment(end).format('YYYY-MM-DD'),
        },
    };

    return response;
};
