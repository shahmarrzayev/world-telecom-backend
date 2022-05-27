const mongoose = require('mongoose');

const { UserRole } = require('../../enums');

const userSchema = mongoose.Schema(
    {
        email: {
            type: String,
            minlength: 4,
            maxlength: 256,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        firstName: {
            type: String,
            minlength: 1,
            maxlength: 256,
            required: true,
        },
        lastName: {
            type: String,
            minlength: 1,
            maxlength: 256,
            required: true,
        },
        maritalStatus: {
            type: String,
            minlength: 1,
            maxlength: 256,
        },
        nationalId: {
            type: String,
            minlength: 7,
            maxlength: 7,
        },
        patronymic: {
            type: String,
            minlength: 1,
            maxlength: 256,
        },
        phoneNumber: {
            type: String,
            minlength: 12,
            maxlength: 12,
        },
        roles: [{ type: String, enum: Object.values(UserRole) }],
        isActive: {
            type: Boolean,
            default: true,
        },
        lastLoginDate: {
            type: Date,
            default: null,
        },
        cart: {
            type: [
                new mongoose.Schema(
                    {
                        productId: {
                            type: String,
                            required: true,
                        },
                        count: {
                            type: Number,
                            default: 1,
                        },
                        userDiscount: {
                            type: Number,
                            default: 0,
                        },
                    },
                    { timestamps: true }
                ),
            ],
        },
    },
    { timestamps: true }
);

const User = mongoose.model('users', userSchema);

module.exports = User;
