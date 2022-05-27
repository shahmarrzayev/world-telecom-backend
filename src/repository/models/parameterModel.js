const mongoose = require('mongoose');

const parameterSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        createdBy: {
            type: mongoose.Types.ObjectId,
            ref: 'users',
            required: true,
        },
        updatedBy: { type: mongoose.Types.ObjectId },
    },
    { timestamps: true }
);

const Parameter = mongoose.model('parameters', parameterSchema);

module.exports = Parameter;
