const mongoose = require('mongoose');

const bannerSchema = mongoose.Schema(
    {
        image: {
            type: String,
            required: true,
        },
        linkUri: {
            type: String,
            default: null,
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const Banner = mongoose.model('banners', bannerSchema);

module.exports = Banner;
