const winston = require('winston');

const generateQueryForNumbers = ({
    operators,
    digitOne,
    digitTwo,
    digitThree,
    digitFour,
    digitFive,
    digitSix,
    digitSeven,
    number,
    minPrice,
    maxPrice,
    status,
} = {}) => {
    winston.debug('numberRepositoryHelper.generateQueryForNumbers -- start');
    const query = {};
    if (operators) query.operator = { $in: operators };
    if (digitOne) query.digitOne = parseInt(digitOne, 10);
    if (digitTwo) query.digitTwo = parseInt(digitTwo, 10);
    if (digitThree) query.digitThree = parseInt(digitThree, 10);
    if (digitFour) query.digitFour = parseInt(digitFour, 10);
    if (digitFive) query.digitFive = digitFive;
    if (digitSix) query.digitSix = digitSix;
    if (digitSeven) query.digitSeven = digitSeven;
    if (number) query.number = number;
    if (minPrice) query.price = { $gte: minPrice };
    if (maxPrice) query.price = { ...query.price, $lte: maxPrice };
    if (status) query.status = status;
    winston.debug('numberRepositoryHelper.generateQueryForNumbers -- success');
    return query;
};

module.exports = {
    generateQueryForNumbers,
};
