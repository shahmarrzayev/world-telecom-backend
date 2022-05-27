const mongoose = require('mongoose');

const { UserRole } = require('../../enums');

const roleSchema = mongoose.Schema(
    {
        name: {
            type: String,
            enum: Object.values(UserRole),
            required: true,
            unique: true,
        },
        ancestors: [{ type: String, enum: Object.values(UserRole) }],
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

const Role = mongoose.model('roles', roleSchema);

module.exports = Role;
