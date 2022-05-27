const mongoose = require('mongoose');

const productOptionSchema = mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products',
            required: true,
            unique: false,
        },
        oneSId: {
            type: String,
            default: null,
        },
        campaigns: [{ type: mongoose.Schema.Types.ObjectId, ref: 'campaigns' }],
        color: { type: String },
        identificator: { type: String },
        slug: { type: String },
        images: [{ type: String }],
        inStock: {
            type: Number,
            default: 0,
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
        loanOptions: [
            {
                _id: { type: String, required: true },
                active: { type: Boolean, default: false },
                color: { type: String, default: null },
                description: { type: String },
                firstPayment: { type: Number },
                image: { type: String },
                isMain: { type: Boolean },
                loanOptionId: { type: String, required: true },
                period: { type: Number },
                price: { type: Number },
                title: { type: String, required: true },
                assignedBy: { type: String, required: true },
                assignedAt: { type: Date, required: true },
            },
        ],
        memory: {
            type: String,
            default: null,
        },
        parameters: [
            {
                name: { type: String },
                value: { type: String },
            },
        ],
        price: {
            type: Number,
            default: 0,
        },
        discount: {
            description: { type: String, default: null },
            price: { type: Number, default: 0 },
        },
        product: {
            manufacturer: { type: String },
            model: { type: String },
            categories: [{ type: String }],
            onlinePaymentEnabled: { type: Boolean },
            albaliKartPaymentEnabled: { type: Boolean },
            birKartPaymentEnabled: { type: Boolean },
            birKartMonths: [{ type: Number }],
            tamKartPaymentEnabled: { type: Boolean },
            loanDescriptions: [{ type: String }],
        },
        fullName: {
            type: String,
            default: null,
        },
        published: {
            type: Boolean,
            default: false,
        },
        purchasedTimes: {
            type: Number,
            default: 0,
        },
        createdBy: {
            type: String,
            required: true,
        },
        updatedBy: {
            type: String,
        },
    },
    { timestamps: true }
);

const ProductOption = mongoose.model('productOptions', productOptionSchema);

module.exports = ProductOption;
