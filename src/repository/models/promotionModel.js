const mongoose = require('mongoose');

const promotionSchema = mongoose.Schema(
    {
        active: {
            type: Boolean,
            default: false,
        },
        image: {
            type: String,
            required: true,
        },
        productId: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String,
            required: true,
        },
        updatedBy: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

const Promotion = mongoose.model('promotions', promotionSchema);

module.exports = Promotion;
