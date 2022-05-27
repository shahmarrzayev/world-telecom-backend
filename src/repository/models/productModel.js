const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
    {
        categories: [{ type: String }],
        isPopular: {
            type: Boolean,
            default: false,
        },
        newProduct: {
            type: Boolean,
            default: false,
        },
        popularityOrder: {
            type: Number,
            default: 0,
        },
        newProductOrder: {
            type: Number,
            default: 0,
        },
        manufacturer: {
            type: String,
            required: true,
        },
        memoryOptions: [{ type: String }],
        model: {
            type: String,
            required: true,
        },
        options: [{ type: mongoose.Schema.Types.ObjectId, ref: 'productOptions' }],
        price: {
            type: Number,
            required: true,
        },
        published: {
            type: Boolean,
            default: false,
        },
        relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'products' }],
        tags: [{ type: String }],
        onlinePaymentEnabled: {
            type: Boolean,
            default: false,
        },
        albaliKartPaymentEnabled: {
            type: Boolean,
            default: false,
        },
        birKartPaymentEnabled: {
            type: Boolean,
            default: false,
        },
        birKartMonths: [{ type: Number }],
        tamKartPaymentEnabled: {
            type: Boolean,
            default: false,
        },
        loanDescriptions: [{ type: String }],
        createdBy: {
            type: String,
            required: true,
        },
        updatedBy: { type: String },
    },
    { timestamps: true }
);

const Product = mongoose.model('products', productSchema);

module.exports = Product;
