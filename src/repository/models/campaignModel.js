const mongoose = require('mongoose');

const campaignSchema = mongoose.Schema(
    {
        active: {
            type: Boolean,
            default: false,
        },
        name: {
            type: String,
            required: true,
            unique: true,
        },
        image: { type: String },
        pricing: [
            {
                from: { type: Number, default: 0 },
                to: { type: Number, default: 1000000 },
                price: { type: Number, default: 0 },
            },
        ],
        color: {
            type: String,
            default: null,
        },
        createdBy: {
            type: String,
            required: true,
        },
        updatedBy: { type: String },
    },
    { timestamps: true }
);

const Campaign = mongoose.model('campaigns', campaignSchema);

module.exports = Campaign;
