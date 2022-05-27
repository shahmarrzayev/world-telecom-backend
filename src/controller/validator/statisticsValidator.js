const { isValidDate } = require('../../utils/commonUtils');

const validateLoanRequestsFromTo = ({ startDate, endDate } = {}) => {
    if ((startDate && !isValidDate(startDate)) || (endDate && !isValidDate(endDate))) {
        return 'Not a valid date';
    }
    return null;
};

module.exports = {
    validateLoanRequestsFromTo,
};
