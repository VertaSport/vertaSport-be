export type DashboardStatsResponse = {
    pendingOrders: number;
    confirmedOrders: number;
    shippingOrders: number;
    cancelledOrders: number;
    outOfStockProducts: number;
};
export interface OrderByDateRangeQuery {
    startDate?: string;
    endDate?: string;
}

export interface OrderByDateRangeStat {
    date: string;
    totalOrders: number;
    totalRevenue: number;
}
export interface ProductStatsQuery {
    startDate?: string;
    endDate?: string;
}

export interface ProductStat {
    _id: string;
    name: string;
    totalQuantity: number;
    totalRevenue: number;
    image: string;
    price: number;
    percentageOfTotal: string;
    percentageOfAllProducts: string;
}

export interface ProductStatsResponse {
    topSellingProducts: ProductStat[];
    leastSellingProducts: ProductStat[];
    dateRange: {
        start: string;
        end: string;
    };
}
export interface TopBuyersQuery {
    dateFilter?: 'range' | 'monthly' | 'yearly';
    startDate?: string;
    endDate?: string;
    month?: string;
    year?: string;
}

export interface TopBuyer {
    _id: string;
    totalOrders: number;
    totalSpent: number;
    totalItems: number;
    lastOrderDate: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
}

export interface LatestOrder {
    _id: string;
    customerName: string;
    customerAvatar: string;
    paymentMethod: string;
    totalPrice: number;
    orderStatus: string;
    createdAt: string;
}

export interface TopBuyersResponse {
    topBuyers: TopBuyer[];
    latestOrders: LatestOrder[];
    dateRange: {
        start: string;
        end: string;
    };
}
