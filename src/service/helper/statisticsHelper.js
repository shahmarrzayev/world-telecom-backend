const { orderBy } = require('lodash');
const moment = require('moment');

const sortByMonthAndMapData = dataArray => {
    if (!dataArray || !dataArray.length) {
        return [];
    }
    const sortedArray = orderBy(dataArray, ['_id'], ['asc']);
    return sortedArray.map(data => {
        return {
            month: moment(data._id).format('MMM'),
            total: data.total,
        };
    });
};

module.exports = {
    sortByMonthAndMapData,
};
