const mongoose = require('mongoose');

const manufacturerSchema = mongoose.Schema(
    {
        name: {
            type: String,
            minlength: 1,
            maxlength: 256,
            required: true,
            unique: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        updatedBy: { type: mongoose.Schema.Types.ObjectId },
    },
    { timestamps: true }
);

const Manufacturer = mongoose.model('manufacturers', manufacturerSchema);

module.exports = Manufacturer;
