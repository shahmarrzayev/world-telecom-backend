const mongoose = require('mongoose');

const { PaymentClient, PaymentStatus } = require('../../enums');

const paymentSchema = mongoose.Schema(
    {
        // OrderID in BirKart
        reference: {
            type: String,
            required: true,
            unique: true,
        },
        orderId: {
            type: mongoose.Types.ObjectId,
            ref: 'orders',
            required: true,
        },
        client: {
            type: String,
            enum: Object.values(PaymentClient),
            default: null,
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(PaymentStatus),
            required: true,
        },
        responseCode: {
            type: Number,
            default: null,
        },
        responseMessage: {
            type: String,
            default: null,
        },
        url: {
            type: String,
            default: null,
        },
        installmentPeriod: {
            type: Number,
            default: 0,
        },
        customerIp: {
            type: String,
            default: null,
        },
        azericard: {
            order: {
                type: String,
                default: null,
            },
            nonce: {
                type: String,
                default: null,
            },
            completitionNonce: {
                type: String,
                default: null,
            },
            pSign: {
                type: String,
                default: null,
            },
            completitionPSign: {
                type: String,
                default: null,
            },
            action: {
                type: String,
                default: null,
            },
            rrn: {
                type: String,
                default: null,
            },
            intRef: {
                type: String,
                default: null,
            },
            lastTransactionType: {
                type: String,
                default: null,
            },
            timestamp: {
                type: String,
                default: null,
            },
            completitionTimestamp: {
                type: String,
                default: null,
            },
        },
        pashaBank: {
            result: {
                type: String,
                default: null,
            },
            resultCode: {
                type: String,
                default: null,
            },
            rrn: {
                type: String,
                default: null,
            },
            approvalCode: {
                type: String,
                default: null,
            },
            cardNumber: {
                type: String,
                default: null,
            },
        },
        unibank: {
            signature: {
                type: String,
                default: null,
            },
            code: {
                type: String,
                default: null,
            },
            rrn: {
                type: String,
                default: null,
            },
            xid: {
                type: String,
                default: null,
            },
        },
    },
    { timestamps: true }
);

const Payment = mongoose.model('payments', paymentSchema);

module.exports = Payment;
