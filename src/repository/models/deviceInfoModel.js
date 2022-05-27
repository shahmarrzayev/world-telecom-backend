const mongoose = require('mongoose');

const deviceInfoSchema = mongoose.Schema(
    {
        customerId: { type: mongoose.Types.ObjectId },
        token: { type: String },
        model: { type: String },
        browserId: { type: String },
    },
    { timestamps: true }
);

module.exports = mongoose.model('deviceinfo', deviceInfoSchema);
