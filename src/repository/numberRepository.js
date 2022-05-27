const winston = require('winston');

const { generateQueryForNumbers } = require('./helper/numberRepositoryHelper');
const { getPaginationDetails, runQuery } = require('./helper/repositoryHelper');
const Number = require('./models/numberModel');

const countNumbers = async (query, transaction) => {
    winston.debug('orderRepository.countNumbers -- start');
    const count = await runQuery(() => Number.countDocuments(query).session(transaction));
    winston.debug('orderRepository.countNumbers -- success');
    return count;
};

const deleteAllNumbers = async transaction => {
    winston.debug('numberRepository.deleteAllNumbers -- start');
    const queryResult = await runQuery(() => Number.deleteMany({}, { session: transaction }));
    winston.debug('numberRepository.deleteAllNumbers -- success');
    return queryResult;
};

const deleteManyNumbersByIds = async (ids, transaction) => {
    winston.debug('numberRepository.deleteManyNumbersByIds -- start');
    if (!ids || !ids.length) {
        winston.warn('numberRepository.deleteManyNumbersByIds -- null or empty param');
        return null;
    }
    const queryResult = await runQuery(() => Number.deleteMany({ _id: { $in: ids } }, { session: transaction }));
    winston.debug('numberRepository.deleteManyNumbersByIds -- success');
    return queryResult;
};

const findManyNumbers = async (filterDetails, transaction) => {
    winston.debug('numberRepository.findManyNumbers -- start');
    const query = generateQueryForNumbers(filterDetails);
    const sort = filterDetails.sort === 'ASC' ? 1 : -1;
    const { skip } = getPaginationDetails(filterDetails) || {};
    const numbers = await runQuery(() =>
        Number.find(query)
            .limit(filterDetails.limit)
            .skip(skip)
            .sort(filterDetails.sort ? { price: sort } : 'createdAt')
            .session(transaction)
    );
    winston.debug('numberRepository.findManyNumbers -- success');
    return { query, numbers };
};

const findManyNumbersByIds = async (ids, transaction) => {
    winston.debug('numberRepository.findManyNumbersByIds -- start');
    if (!ids || !ids.length) {
        winston.warn('numberRepository.findManyNumbersByIds -- null or empty param');
        return null;
    }
    const numbers = await runQuery(() => Number.find({ _id: { $in: ids } }).session(transaction));
    winston.debug('numberRepository.findManyNumbersByIds -- success');
    return numbers;
};

const findNumberById = async (id, transaction) => {
    winston.debug('numberRepository.findNumberById -- start');
    if (!id) {
        winston.warn('numberRepository.findNumberById -- null param');
        return null;
    }
    const number = await runQuery(() => Number.findById(id).session(transaction));
    winston.debug('numberRepository.findNumberById -- success');
    return number;
};

const findNumberByOperatorAndNumber = async (operator, number, transaction) => {
    winston.debug('numberRepository.findNumberByOperatorAndNumber -- start');
    if (!operator || !number) {
        winston.warn('numberRepository.findNumberByOperatorAndNumber -- null param');
        return null;
    }
    const numberEntity = await runQuery(() => Number.findOne({ operator, number }).session(transaction));
    winston.debug('numberRepository.findNumberByOperatorAndNumber -- success');
    return numberEntity;
};

const saveManyNumbers = async (numbers, transaction) => {
    winston.debug('numberRepository.saveManyNumbers -- start');
    if (!numbers || !numbers.length) {
        winston.warn('numberRepository.saveManyNumbers -- null or empty param');
        return null;
    }
    const queryResult = await runQuery(() => Number.insertMany(numbers, { session: transaction }));
    winston.debug('numberRepository.saveManyNumbers -- success');
    return queryResult;
};

const saveNumber = async (number, transaction) => {
    winston.debug('numberRepository.saveNumber -- start');
    if (!number) {
        winston.warn('numberRepository.saveNumber -- null or empty param');
        return null;
    }
    // eslint-disable-next-line no-new-wrappers
    const dbNumber = new Number(number);
    const numberEntity = await runQuery(() => dbNumber.save({ session: transaction }));
    winston.debug('numberRepository.saveNumber -- success');
    return numberEntity;
};

const updateNumber = async (id, number, transaction) => {
    winston.debug('numberRepository.updateNumber -- start');
    if (!id || !number) {
        winston.warn(`numberRepository.updateNumber -- null param: ${id}, ${number}`);
        return null;
    }
    const savedNumber = await runQuery(() =>
        Number.findByIdAndUpdate(id, number, {
            new: true,
            session: transaction,
            useFindAndModify: false,
        })
    );
    winston.debug('numberRepository.updateNumber -- success');
    return savedNumber;
};

module.exports = {
    countNumbers,
    deleteAllNumbers,
    deleteManyNumbersByIds,
    findManyNumbers,
    findManyNumbersByIds,
    findNumberById,
    findNumberByOperatorAndNumber,
    saveManyNumbers,
    saveNumber,
    updateNumber,
};
