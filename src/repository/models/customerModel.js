const mongoose = require('mongoose');

const customerSchema = mongoose.Schema(
    {
        firstName: {
            type: String,
            minlength: 1,
            maxlength: 256,
        },
        lastName: {
            type: String,
            minlength: 1,
            maxlength: 256,
        },
        password: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/],
            minlength: 3,
            maxlength: 256,
        },
        mobilePhone: { type: String },
        birthDate: { type: Date },
        idType: { type: String },
        serialNumber: { type: String },
        finCode: { type: String },
        gender: { type: String },
        isActive: { type: Boolean },

        cart: {
            type: [
                {
                    productId: { type: String },
                    productOptionId: { type: String },
                    numberId: { type: String },
                    count: {
                        type: Number,
                        default: 1,
                    },
                },
            ],
        },
        favoriteCart: {
            type: [
                {
                    productId: { type: String },
                    productOptionId: { type: String },
                    numberId: { type: String },
                },
            ],
        },
        addresses: {
            type: [
                new mongoose.Schema(
                    {
                        street: { type: String },
                        houseNumber: { type: String },
                        district: { type: String },
                        city: { type: String },
                    },
                    { timestamps: true }
                ),
            ],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('customers', customerSchema);
