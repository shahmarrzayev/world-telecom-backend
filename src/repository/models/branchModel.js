const mongoose = require('mongoose');

const { StoreType } = require('../../enums');

const branchSchema = mongoose.Schema(
    {
        address: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            default: null,
        },
        lat: {
            type: String,
            required: true,
        },
        lng: {
            type: String,
            required: true,
        },
        order: {
            type: Number,
            default: 0,
        },
        phone: {
            type: String,
            default: null,
        },
        type: {
            type: String,
            enum: Object.values(StoreType),
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

const Branch = mongoose.model('branches', branchSchema);

module.exports = Branch;
