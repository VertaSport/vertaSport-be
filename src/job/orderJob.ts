import Order from '@/models/Order';
import { ORDER_STATUS } from '@/constant/order';
import { CronJob } from 'cron';

// Cron job to process updating the order status

export const checkOrderJob = CronJob.from({
    cronTime: '* * * * *',
    onTick: async () => {
        const estimatedTime = new Date();
        estimatedTime.setDate(estimatedTime.getDate() - 3);

        console.log(`Estimated time: ${estimatedTime}`);

        const orders = await Order.find({
            orderStatus: ORDER_STATUS.DELIVERED,
            updatedAt: { $lt: estimatedTime },
        });
        console.log(`Processing queue (${orders.length})...`);
        if (orders.length) {
            orders.forEach(async (order) => {
                order.orderStatus = ORDER_STATUS.DONE;
                await order.save();
            });
            return Promise.resolve();
        }

        return Promise.resolve();
    },
    start: true,
    timeZone: 'America/Los_Angeles',
});
