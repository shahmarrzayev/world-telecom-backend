const mongoose = require('mongoose');

const categorySchema = mongoose.Schema(
    {
        parentId: {
            type: mongoose.Types.ObjectId,
        },
        name: {
            type: String,
            minlength: 1,
            maxlength: 256,
            unique: true,
        },
        showSubcategories: {
            type: Boolean,
            default: false,
        },
        slug: {
            type: String,
            minlength: 1,
            maxlength: 256,
            unique: true,
        },
        ancestors: [
            {
                _id: {
                    type: String,
                },
                name: {
                    type: String,
                    minlength: 1,
                    maxlength: 256,
                },
                slug: {
                    type: String,
                    minlength: 1,
                    maxlength: 256,
                },
            },
        ],
        seoTitle: {
            type: String,
            maxlength: 256,
        },
        seoDescription: {
            type: String,
            maxlength: 256,
        },
        description: {
            type: String,
            maxlength: 64000,
        },
        images: [
            {
                image: {
                    type: String
                },
                href: {
                    type: String
                }
            }
        ],
        isMain: {
            type: Boolean,
            default: false,
        },
        createdBy: {
            type: String,
            required: true,
        },
        updatedBy: {
            type: String,
        },
    },
    { timestamps: true }
);

const Category = mongoose.model('categories', categorySchema);

module.exports = Category;
