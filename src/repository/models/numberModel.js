const mongoose = require('mongoose');

const { NumberStatus } = require('../../enums');

const numberSchema = mongoose.Schema(
    {
        operator: {
            type: String,
            required: true,
        },
        number: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        loanPrice: { type: Number },
        status: {
            type: String,
            enum: Object.values(NumberStatus),
            required: true,
        },
        digitOne: {
            type: Number,
            required: true,
        },
        digitTwo: {
            type: Number,
            required: true,
        },
        digitThree: {
            type: Number,
            required: true,
        },
        digitFour: {
            type: Number,
            required: true,
        },
        digitFive: {
            type: Number,
            required: true,
        },
        digitSix: {
            type: Number,
            required: true,
        },
        digitSeven: {
            type: Number,
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

const NumberModel = mongoose.model('numbers', numberSchema);

module.exports = NumberModel;
