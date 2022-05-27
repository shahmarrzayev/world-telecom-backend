const winston = require('winston');
const { runQuery } = require('./helper/repositoryHelper');
const Filter = require('./models/filterModel');

const saveFilter = async (filter, transaction) => {
    winston.debug('filterRepository.saveFilter -- start');
    if (!filter) {
        winston.debug('filterRepository.saveFilter -- null param');
        return null;
    }
    const dbFilters = new Filter(filter);
    const queryResult = runQuery(() => dbFilters.save({ session: transaction }));
    winston.debug('filterRepository.saveFilter -- success');
    return queryResult;
}

const findFilterById = async (id, transaction) => {
    winston.debug('filterRepository.findFilterById -- start');
    if (!id) {
        winston.debug('filterRepository.findFilterById -- null param');
        return null;
    }
    const filter = await runQuery(() =>
        Filter.findById(id).session(transaction)
    )
    winston.debug('filterRepository.findFilterById -- success');
    return filter;
}

const findFilterByNameAndKey = async (categoryName, filterKey, transaction) => {
    winston.debug('filterRepository.findFilterByNameAndKey -- start');
    if (!categoryName || !filterKey) {
        winston.debug('filterRepository.findFilterByNameAndKey -- null param');
        return null;
    }
    const filter = await runQuery(() =>
        Filter.findOne({ categoryName, filterKey }).session(transaction)
    )
    winston.debug('filterRepository.findFilterByNameAndKey -- success');
    return filter
}

const findFiltersByCategoryName = async (categoryName, transaction) => {
    winston.debug('filterRepository.findFiltersByCategoryName -- start');
    if (!categoryName) {
        winston.debug('filterRepository.findFiltersByCategoryName -- null param');
        return null;
    }
    const filters = await runQuery(() =>
        Filter.find({ categoryName, filterOn: true }).session(transaction)
    );
    winston.debug('filterRepository.findFiltersByCategoryName -- start');
    return filters;
}

const updateFilterById = async (id, filter, transaction) => {
    winston.debug('filterRepository.activateFiltersById -- start');
    if (!id || !filter) {
        winston.debug('filterRepository.activateFiltersById -- null param');
        return null;
    }

    const updatedFilter = await runQuery(() =>
        Filter.findOneAndUpdate({ _id: id }, filter, {
            session: transaction,
            useFindAndModify: false
        })
    )

    winston.debug('filterRepository.activateFiltersById -- success');
    return updatedFilter;
}

module.exports = {
    saveFilter,
    findFilterByNameAndKey,
    findFiltersByCategoryName,
    findFilterById,
    updateFilterById
}