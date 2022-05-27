const mongoose = require('mongoose');

const parameterTemplateSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        parameters: [{ type: String }],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        updatedBy: { type: mongoose.Schema.Types.ObjectId },
    },
    { timestamps: true }
);

const ParameterTemplate = mongoose.model('parameterTemplates', parameterTemplateSchema);

module.exports = ParameterTemplate;
