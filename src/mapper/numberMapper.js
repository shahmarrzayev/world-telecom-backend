/* eslint-disable prefer-destructuring */
const { pick } = require('lodash');

const mapNumberEntityToNumberView = entity => {
    return entity ? pick(entity, ['_id', 'operator', 'number', 'price', 'loanPrice', 'status']) : null;
};

const mapNumberViewToNumberEntity = view => {
    if (!view || !view.number || view.number.length !== 7) return null;

    const entity = {};
    entity.operator = view.operator;
    entity.number = view.number;
    entity.price = view.price;
    entity.loanPrice = view.loanPrice;
    entity.status = view.status;
    entity.digitOne = view.number[0];
    entity.digitTwo = view.number[1];
    entity.digitThree = view.number[2];
    entity.digitFour = view.number[3];
    entity.digitFive = view.number[4];
    entity.digitSix = view.number[5];
    entity.digitSeven = view.number[6];

    return entity;
};

module.exports = {
    mapNumberEntityToNumberView,
    mapNumberViewToNumberEntity,
};
