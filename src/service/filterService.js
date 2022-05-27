const winston = require("winston");
const { flatten, uniq } = require("lodash");
const { GeneralException } = require("../exceptions");
const { findParametersFromProductOptions } = require("../repository/productOptionRepository");
const { saveFilter, findFilterByNameAndKey, findFiltersByCategoryName, updateFilterById, findFilterById } = require("../repository/filterRepository");
const { flushCache } = require("../utils/cacheUtils");

const addNewFilters = async (category) => {
    winston.debug('filterService.addNewFilters -- start');
    const name = category.name;
    if (!name) {
        winston.warn('filterService.addNewFilters -- null param');
        throw new GeneralException();
    }

    const parameters = flatten(await findParametersFromProductOptions(category.name));

    const filters = [];
    for (let i = 0; i < parameters.length; i++) {
        let parameter = parameters[i];
        let index = filters.findIndex((filter) => filter.filterKey === parameter.name);
        if (index !== -1) {
            filters[index].filterValues.push(parameter.value.trim());
            filters[index].filterValues = uniq(filters[index].filterValues);
            continue;
        }

        filters.push({
            categoryName: name,
            label: parameter.name,
            filterKey: parameter.name,
            filterOn: false,
            filterValues: [parameter.value.trim()]
        });
    }

    filters.forEach(async filterEntity => {
        let filter = await findFilterByNameAndKey(filterEntity.categoryName, filterEntity.filterKey);
        if (!filter) {
            await saveFilter(filterEntity);
        };
    })

    flushCache();
    winston.debug('filterService.addNewFilters -- success');
    return filters;
}

const getFilters = async (name) => {
    winston.debug('filterService.getFilters -- start');
    if (!name) {
        winston.warn('filterService.getFilters -- null param');
        throw new GeneralException();
    }
    const filters = await findFiltersByCategoryName(name);
    flushCache();
    winston.debug('filterService.getFilters -- start');
    return filters;
}

const activateFilters = async (filterIds, transaction) => {
    winston.debug('filterService.activateFilters -- start');
    if (!filterIds || !filterIds.length) {
        winston.debug('filterService.activateFilters -- null param');
        throw new GeneralException();
    }
    
    const filters = [];
    for (let i = 0; i < filterIds.length; i++) {
        const filter = await findFilterById(filterIds[i]);
        if (!filter){
            continue;
        }
        
        filter.filterOn = true;
        const updatedFilter = await updateFilterById(filter._id, filter, transaction);
        filters.push(updatedFilter);
    }

    flushCache();
    winston.debug('filterService.activateFilters -- success');
    return filters;
}

const deactivateFilters = async (filterIds, transaction) => {
    winston.debug('filterService.deactivateFilters -- start');
    if (!filterIds || !filterIds.length ) {
        winston.debug('filterService.deactivateFilters -- null param');
        throw new GeneralException();
    }

    const filters = [];
    for (let i = 0; i < filterIds.length; i++) {
        const filter = await findFilterById(filterIds[i]);
        if (!filter){
            continue;
        }
        
        filter.filterOn = false;
        const updatedFilter = await updateFilterById(filter._id, filter, transaction);
        filters.push(updatedFilter);
    }
    
    flushCache();
    winston.debug('filterService.deactivateFilters -- success');
    return filters;
}

module.exports = {
    addNewFilters,
    getFilters,
    activateFilters,
    deactivateFilters
};