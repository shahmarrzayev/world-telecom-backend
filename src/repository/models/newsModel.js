const mongoose = require('mongoose');

const newsSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            default: null,
        },
        published: {
            type: Boolean,
            default: false,
        },
        video: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

const News = mongoose.model('news', newsSchema);

module.exports = News;
