const mongoose = require('mongoose');

const loanSchema = mongoose.Schema(
    {
        active: {
            type: Boolean,
            default: false,
        },
        title: {
            type: String,
            unique: true,
            required: true,
        },
        image: { type: String },
        color: { type: String },
        createdBy: {
            type: String,
            required: true,
        },
        updatedBy: { type: String },
    },
    { timestamps: true }
);

const Loan = mongoose.model('loans', loanSchema);

module.exports = Loan;
