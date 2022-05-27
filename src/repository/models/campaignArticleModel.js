const mongoose = require('mongoose');

const articleProductOptionsSchema = mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId },
    optionSlugs: [{ type: String }],
});

const campaignArticleSchema = mongoose.Schema(
    {
        title: { type: String, required: true },
        subtitle: { type: String },
        description: { type: String },
        image: { type: String },
        thumbnail: { type: String },
        products: [articleProductOptionsSchema],
        published: { type: Boolean, default: false },
        order: { type: Number },
        slug: { type: String, required: true },
        validFrom: { type: Date },
        validTo: { type: Date },
    },
    { timestamps: true }
);

const CampaignArticle = mongoose.model('campaignArticles', campaignArticleSchema);

module.exports = CampaignArticle;
