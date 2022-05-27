const mongoose = require('mongoose');

const { OrderStatus, PaymentType } = require('../../enums');

const orderSchema = mongoose.Schema(
    {
        customerId: { type: String },
        name: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            default: null,
        },
        mobilePhone: {
            type: String,
            required: true,
        },
        paymentType: {
            type: String,
            enum: Object.values(PaymentType),
        },
        orderedProductOptions: [
            {
                _id: { type: String },
                selectedCampaigns: [
                    {
                        _id: { type: String },
                        price: { type: Number },
                    },
                ],
                manufacturer: { type: String },
                model: { type: String },
                identificator: { type: String },
                price: { type: Number },
                count: { type: Number, default: 1 },
            },
        ],
        orderedNumbers: [
            {
                _id: { type: String },
                selectedCampaigns: [
                    {
                        _id: { type: String },
                        price: { type: Number },
                    },
                ],
                operator: { type: String },
                number: { type: String },
                price: { type: Number },
            },
        ],
        orderStatus: {
            type: String,
            enum: Object.values(OrderStatus),
            default: OrderStatus.PENDING_PAYMENT,
        },
        totalPrice: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

const Order = mongoose.model('orders', orderSchema);

module.exports = Order;
