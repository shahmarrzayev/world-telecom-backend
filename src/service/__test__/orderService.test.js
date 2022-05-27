jest.mock('winston');
jest.mock('../campaignService');
jest.mock('../paymentService');
jest.mock('../helper/orderHelper');
jest.mock('../../mapper/orderMapper');
jest.mock('../../repository/orderRepository');
jest.mock('../../repository/paymentRepository');

const { getAllCampaigns } = require('../campaignService');
const { getManyOrders, getOrderById, modifyOrder, registerOrder } = require('../orderService');
const { revertPayment } = require('../paymentService');
const { PaymentType, OrderStatus } = require('../../enums');
const {
    assignOrderedNumbers,
    assignOrderedProductOptions,
    calculateTotalPrice,
    getFilterParamsFromRequestQuery,
} = require('../helper/orderHelper');
const { GeneralException, NotFoundException } = require('../../exceptions');
const {
    mapNumberEntitiesToOrderedNumbers,
    mapOrderViewToOrderEntity,
    mapProductOptionEntitiesToOrderedProductOptions,
} = require('../../mapper/orderMapper');
const {
    countOrdersByQuery,
    findManyOrders,
    findOrderById,
    saveOrder,
    updateOrder,
} = require('../../repository/orderRepository');
const { findPaymentByOrderId } = require('../../repository/paymentRepository');

afterEach(() => {
    jest.clearAllMocks();
});

beforeEach(() => {
    calculateTotalPrice.mockReturnValue(100);
    countOrdersByQuery.mockReturnValue(Promise.resolve(2));
    getAllCampaigns.mockReturnValue(Promise.resolve(['c1', 'c2']));
    findManyOrders.mockReturnValue(Promise.resolve({ query: 'query', orders: ['order1', 'order2'] }));
    findOrderById.mockReturnValue(Promise.resolve('orderEntity'));
    findPaymentByOrderId.mockReturnValue(Promise.resolve('paymentEntity'));
    getFilterParamsFromRequestQuery.mockReturnValue({ limit: 'limit', page: 'page' });
    mapNumberEntitiesToOrderedNumbers.mockReturnValue('orderedNumbers');
    mapOrderViewToOrderEntity.mockReturnValue({ orderedProductOptions: [{ _id: 'po1' }, { _id: 'po2' }] });
    mapProductOptionEntitiesToOrderedProductOptions.mockReturnValue('orderedProductOptions');
    revertPayment.mockReturnValue(Promise.resolve('reverted'));
    updateOrder.mockReturnValue(Promise.resolve('updatedOrderEntity'));
    saveOrder.mockReturnValue(Promise.resolve('savedOrderEntity'));
    assignOrderedNumbers.mockReturnValue(Promise.resolve('orderedNumbers'));
    assignOrderedProductOptions.mockReturnValue(Promise.resolve('orderedProductOptions'));
});

describe('orderService', () => {
    describe('getManyOrders', () => {
        test('success', async () => {
            const result = await getManyOrders('requestQuery');

            expect(result).toBeDefined();
            expect(result.orders).toBeDefined();
            expect(result.orders.length).toBe(2);
            expect(findManyOrders).toHaveBeenCalledTimes(1);
            expect(countOrdersByQuery).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when requestQuery param not defined', async () => {
            await expect(getManyOrders()).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when cannot get orders', async () => {
            findManyOrders.mockReturnValue(Promise.resolve(null));

            await expect(getManyOrders('requestQuery')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when returned query not defined', async () => {
            findManyOrders.mockReturnValue(Promise.resolve({ query: null, orders: ['order1', 'order2'] }));

            await expect(getManyOrders('requestQuery')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when returned orders not defined', async () => {
            findManyOrders.mockReturnValue(Promise.resolve({ query: 'query', orders: null }));

            await expect(getManyOrders('requestQuery')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when cannot count orders', async () => {
            countOrdersByQuery.mockReturnValue(Promise.resolve(null));

            await expect(getManyOrders('requestQuery')).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('getOrderById', () => {
        test('success', async () => {
            const result = await getOrderById('id');

            expect(result).toBe('orderEntity');
            expect(findOrderById).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when id param not defined', async () => {
            await expect(getOrderById()).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws not found exception when id order not found', async () => {
            findOrderById.mockReturnValue(Promise.resolve(null));

            await expect(getOrderById('id')).rejects.toEqual(expect.any(NotFoundException));
        });
    });

    describe('modifyOrder', () => {
        test('success -- cash', async () => {
            const result = await modifyOrder('id', 'orderView', 'userId');

            expect(result).toBe('updatedOrderEntity');
            expect(findOrderById).toHaveBeenCalledTimes(1);
            expect(findPaymentByOrderId).toHaveBeenCalledTimes(0);
            expect(revertPayment).toHaveBeenCalledTimes(0);
            expect(updateOrder).toHaveBeenCalledTimes(1);
        });

        test('success -- online', async () => {
            findOrderById.mockReturnValue(Promise.resolve({ paymentType: 'ONLINE' }));

            const result = await modifyOrder('id', { orderStatus: OrderStatus.CANCELED }, 'userId');

            expect(result).toBe('updatedOrderEntity');
            expect(findOrderById).toHaveBeenCalledTimes(1);
            expect(revertPayment).toHaveBeenCalledTimes(1);
            expect(updateOrder).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when id param not defined', async () => {
            await expect(modifyOrder(null, 'orderView', 'userId')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when orderView param not defined', async () => {
            await expect(modifyOrder('id', null, 'userId')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when userId param not defined', async () => {
            await expect(modifyOrder('id', 'orderView', null)).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws not found exception when order not found', async () => {
            findOrderById.mockReturnValue(Promise.resolve(null));

            await expect(modifyOrder('id', 'orderView', 'userId')).rejects.toEqual(expect.any(NotFoundException));
        });

        test('throws general exception when cannot update order', async () => {
            updateOrder.mockReturnValue(Promise.resolve(null));

            await expect(modifyOrder('id', 'orderView', 'userId')).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('registerOrder', () => {
        let mockOrderView;

        beforeEach(() => {
            mockOrderView = {
                orderedProductOptions: [
                    { id: 1, price: 1, published: true },
                    { id: 2, price: 1, published: true },
                ],
            };
        });

        test('success - cash', async () => {
            const result = await registerOrder(mockOrderView);

            expect(result).toBe('savedOrderEntity');
            expect(getAllCampaigns).toHaveBeenCalledTimes(1);
            expect(mapOrderViewToOrderEntity).toHaveBeenCalledTimes(1);
            expect(assignOrderedNumbers).toHaveBeenCalledTimes(1);
            expect(assignOrderedProductOptions).toHaveBeenCalledTimes(1);
            expect(calculateTotalPrice).toHaveBeenCalledTimes(1);
            expect(saveOrder).toHaveBeenCalledTimes(1);
        });

        test('success - online', async () => {
            saveOrder.mockReturnValue(Promise.resolve({ paymentType: PaymentType.ONLINE }));

            await registerOrder(mockOrderView);

            expect(getAllCampaigns).toHaveBeenCalledTimes(1);
            expect(mapOrderViewToOrderEntity).toHaveBeenCalledTimes(1);
            expect(assignOrderedNumbers).toHaveBeenCalledTimes(1);
            expect(assignOrderedProductOptions).toHaveBeenCalledTimes(1);
            expect(calculateTotalPrice).toHaveBeenCalledTimes(1);
            expect(saveOrder).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when orderView param not defined', async () => {
            getAllCampaigns.mockReturnValue(Promise.resolve(null));

            await expect(registerOrder()).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when cannot get campaigns', async () => {
            getAllCampaigns.mockReturnValue(Promise.resolve(null));

            await expect(registerOrder(mockOrderView)).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws not found exception when no ordered products and numbers', async () => {
            assignOrderedNumbers.mockReturnValue(Promise.resolve(null));
            assignOrderedProductOptions.mockReturnValue(Promise.resolve(null));

            await expect(registerOrder(mockOrderView)).rejects.toEqual(expect.any(NotFoundException));
        });

        test('throws general exception when cannot save order', async () => {
            saveOrder.mockReturnValue(Promise.resolve(null));

            await expect(registerOrder(mockOrderView)).rejects.toEqual(expect.any(GeneralException));
        });
    });
});
