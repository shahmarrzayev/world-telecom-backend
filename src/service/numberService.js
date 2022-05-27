const winston = require('winston');

const { getFilterParamsFromRequestQuery } = require('./helper/numberHelper');
const { mapNumberViewToNumberEntity } = require('../mapper/numberMapper');
const {
    countNumbers,
    deleteAllNumbers,
    deleteManyNumbersByIds,
    findManyNumbers,
    findManyNumbersByIds,
    findNumberByOperatorAndNumber,
    saveManyNumbers,
    saveNumber,
    updateNumber,
} = require('../repository/numberRepository');
const { ConflictException, GeneralException, NotFoundException } = require('../exceptions');

/**
 * Add many numbers.
 * @param {Array<NumberEntity>} numbers
 * @param {Transaction} transaction
 */
const addManyNumbers = async (numbers, transaction) => {
    winston.debug('numberService.addManyNumbers -- start');
    if (!numbers || !numbers.length) {
        winston.warn('numberService.addManyNumbers -- null param');
        throw new GeneralException();
    }

    const numbersDeleted = await deleteAllNumbers(transaction);
    if (!numbersDeleted) {
        winston.warn('numberService.addManyNumbers -- could not delete numbers');
        throw new GeneralException();
    }
    const numbersSaved = await saveManyNumbers(numbers, transaction);
    if (!numbersSaved) {
        winston.warn('numberService.addManyNumbers -- could not save numbers');
        throw new GeneralException();
    }
    winston.debug('numberService.addManyNumbers -- success');
};

/**
 * Add single number.
 * @param {NumberEntity} numberView
 * @param {UserEntity} user
 */
const addNumber = async (numberView, user) => {
    winston.debug('numberService.addNumber -- start');
    if (!numberView || !user) {
        winston.warn('numberService.addNumber -- null param');
        throw new GeneralException();
    }

    const numberExists = await findNumberByOperatorAndNumber(numberView.operator, numberView.number);
    if (numberExists) {
        winston.warn('numberService.addNumber -- number already exists');
        throw new ConflictException('Bu nömrə artıq mövcuddur');
    }

    const numberEntity = mapNumberViewToNumberEntity(numberView);
    if (!numberEntity) {
        winston.warn('numberService.addNumber -- could not map view to entity');
        throw new GeneralException();
    }
    numberEntity.createdBy = user;

    const savedNumberEntity = await saveNumber(numberEntity);
    if (!savedNumberEntity) {
        winston.warn('numberService.addNumber -- could not save number');
        throw new GeneralException();
    }
    winston.debug('numberService.addNumber -- success');
    return savedNumberEntity;
};

/**
 * Delete many numbers by ids.
 * @param {Arrays<String>} ids
 */
const deleteNumbersByIds = async ids => {
    winston.debug('numberService.deleteNumbersByIds -- start');
    if (!ids || !ids.length) {
        winston.warn('numberService.deleteNumbersByIds -- null or empty param');
        throw new GeneralException();
    }

    const numbersDeleted = await deleteManyNumbersByIds(ids);
    if (!numbersDeleted) {
        winston.warn('numberService.deleteNumbersByIds -- could not delete numbers');
        throw new GeneralException();
    }
    winston.debug('numberService.deleteNumbersByIds -- success');
};

/**
 * Get numbers (with filter and pagination).
 * @param {Request.query} requestQuery
 * @param {UserEntity} user (optional)
 * @returns {Promise<Object>}
 */
const getManyNumbers = async (requestQuery, user) => {
    winston.debug('numberService.getManyNumbers -- start');
    if (!requestQuery) {
        winston.warn('numberService.getManyNumbers -- null param');
        throw new GeneralException();
    }

    const filterDetails = getFilterParamsFromRequestQuery(requestQuery, user);
    if (!filterDetails) {
        winston.warn('numberService.getManyNumbers -- could not generate filter params');
        throw new GeneralException();
    }

    const { query, numbers } = (await findManyNumbers(filterDetails)) || {};
    if (!query || !numbers) {
        winston.warn('numberService.getManyNumbers -- could not get numbers');
        throw new GeneralException();
    }

    const total = await countNumbers(query);
    if (total !== 0 && !total) {
        winston.warn('numberService.getManyNumbers -- could not count numbers');
        throw new GeneralException();
    }
    winston.debug('numberService.getManyNumbers -- success');
    return {
        limit: filterDetails.limit,
        numbers,
        page: filterDetails.page,
        total,
    };
};

/**
 * Get numbers by ids.
 * @param {Array<String>} ids
 * @returns {Promise<Array<NumberEntity>>}
 */
const getManyNumbersByIds = async ids => {
    winston.debug('numberService.getManyNumbersByIds -- start');
    if (!ids || !ids.length) {
        winston.warn('numberService.getManyNumbersByIds -- no ids provided');
        throw new GeneralException();
    }
    const numbers = await findManyNumbersByIds(ids);
    if (!numbers) {
        winston.warn('numberService.getManyNumbersByIds -- could not get numbers');
        throw new GeneralException();
    }
    winston.debug('numberService.getManyNumbersByIds -- success');
    return numbers;
};

/**
 * Update number.
 * @param {String} id
 * @param {NumberView} numberView
 * @returns {Promise<NumberEntity>}
 */
const modifyNumber = async (id, numberView) => {
    winston.debug('numberService.modifyNumber -- start');
    if (!id || !numberView) {
        winston.warn(`numberService.modifyNumber -- null param: ${id}, ${numberView}`);
        throw new GeneralException();
    }
    const numberEntity = await updateNumber(id, numberView);
    if (!numberEntity) {
        winston.warn('numberService.modifyNumber -- number not found');
        throw new NotFoundException('Nömrə tapılmadı');
    }
    winston.debug('numberService.modifyNumber -- success');
    return numberEntity;
};

module.exports = {
    addManyNumbers,
    addNumber,
    deleteNumbersByIds,
    getManyNumbers,
    getManyNumbersByIds,
    modifyNumber,
};
