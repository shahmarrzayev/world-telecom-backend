const { NumberStatus } = require('../../enums');

const getFilterParamsFromRequestQuery = (query, user) => {
    if (!query) {
        return null;
    }
    const result = {};
    result.operators = query.operators ? query.operators.split(' ') : null;
    result.digitOne = query.digitOne;
    result.digitTwo = query.digitTwo;
    result.digitThree = query.digitThree;
    result.digitFour = query.digitFour;
    result.digitFive = query.digitFive;
    result.digitSix = query.digitSix;
    result.digitSeven = query.digitSeven;
    result.number = query.number;
    result.minPrice = parseFloat(query.minPrice);
    result.maxPrice = parseFloat(query.maxPrice);
    result.page = parseInt(query.page, 10) || 1;
    result.limit = query.limit && parseInt(query.limit, 10) <= 100 ? parseInt(query.limit, 10) : 10;
    result.sort = query.sort;
    result.status = user ? null : NumberStatus.AVAILABLE;
    return result;
};

module.exports = {
    getFilterParamsFromRequestQuery,
};
