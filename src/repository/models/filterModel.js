const mongoose = require('mongoose');

const filter = mongoose.Schema(
    {
        categoryName: {
            type: String
        },
        label: {
            type: String
        },
        filterKey: {
            type: String
        },
        filterValues: [
            { type: String }
        ],
        filterOn: {
            type: Boolean
        }
    })

const Filter = mongoose.model('filters', filter)

module.exports = Filter;