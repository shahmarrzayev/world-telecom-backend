const winston = require('winston');

const { validateNumber } = require('./validator/numberValidator');
const { BadRequestException } = require('../exceptions');
const { mapNumberEntityToNumberView } = require('../mapper/numberMapper');
const {
    addNumber,
    deleteNumbersByIds,
    getManyNumbers,
    getManyNumbersByIds,
    modifyNumber,
} = require('../service/numberService');

/**
 * Add new number.
 */
const addNumberController = async (req, res) => {
    winston.debug('numberController.addNumber -- start');
    const { body, user } = req;
    const error = validateNumber(body);
    if (error) {
        winston.warn(`numberController.addNumber -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    const numberEntity = await addNumber(req.body, user);
    winston.debug('numberController.addNumber -- success');
    return res.send(mapNumberEntityToNumberView(numberEntity));
};

/**
 * Delete number by id.
 */
const deleteNumbersByIdsController = async (req, res) => {
    winston.debug('numberController.deleteNumbersByIds -- start');
    await deleteNumbersByIds(req.body);
    winston.debug('numberController.deleteNumbersByIds -- start');
    return res.send();
};

/**
 * Get many numbers.
 */
const getManyNumbersController = async (req, res) => {
    winston.debug('numberController.getManyNumbers -- start');
    const response = await getManyNumbers(req.query, req.user);
    response.numbers = response.numbers.map(mapNumberEntityToNumberView);
    winston.debug('numberController.getManyNumbers -- success');
    return res.send(response);
};

/**
 * Get many numbers by ids.
 */
const getManyNumbersByIdsController = async (req, res) => {
    winston.debug('numberController.getManyNumbersByIds -- start');
    const numberIds = req.query.id && req.query.id.length ? req.query.id : [];
    const numbers = numberIds && numberIds.length ? await getManyNumbersByIds(numberIds.split(' ')) : [];
    winston.debug('numberController.getManyNumbersByIds -- success');
    return res.send(numbers.map(mapNumberEntityToNumberView));
};

/**
 * Modify number.
 */
const modifyNumberController = async (req, res) => {
    winston.debug('numberController.modifyNumber -- start');
    const { body, params } = req;
    const error = validateNumber(body);
    if (error) {
        winston.warn(`numberController.modifyNumber -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    const numberEntity = await modifyNumber(params.id, body);
    winston.debug('numberController.modifyNumber -- success');
    return res.send(mapNumberEntityToNumberView(numberEntity));
};

module.exports = {
    addNumberController,
    deleteNumbersByIdsController,
    getManyNumbersController,
    getManyNumbersByIdsController,
    modifyNumberController,
};
