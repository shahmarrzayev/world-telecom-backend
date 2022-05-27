const mongoose = require('mongoose');

const { LoanRequestStatus, LoanRequestWtStatus } = require('../../enums');

const loanRequestSchema = mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
        },
        fin: {
            type: String,
            required: true,
        },
        mobilePhone: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(LoanRequestStatus),
            default: LoanRequestStatus.PENDING,
        },
        wtStatus: {
            type: String,
            enum: Object.values(LoanRequestWtStatus),
            default: LoanRequestWtStatus.OPEN,
        },
        orderId: {
            type: String,
            default: null,
        },
        totalPrice: {
            type: Number,
            required: true,
        },
        orderedProductOption: {
            _id: { type: String },
            selectedCampaigns: [
                {
                    _id: { type: String },
                    price: { type: Number },
                },
            ],
            selectedLoan: {
                _id: { type: String },
                price: { type: Number },
                firstPayment: { type: Number },
                period: { type: Number },
            },
            manufacturer: { type: String },
            model: { type: String },
            identificator: { type: String },
            price: { type: String },
        },
        orderedNumber: {
            _id: { type: String },
            operator: { type: String },
            number: { type: String },
            price: { type: Number },
            loanPrice: { type: Number },
        },
        updatedBy: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

const LoanRequest = mongoose.model('loanrequests', loanRequestSchema);

module.exports = LoanRequest;
