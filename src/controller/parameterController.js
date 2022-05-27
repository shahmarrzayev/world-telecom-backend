const winston = require('winston');

const { validateParameter } = require('./validator/parameterValidator');
const { validateArrayOfObjectIds } = require('./validator/commonValidator');
const { BadRequestException } = require('../exceptions');
const { mapParameterEntityToParameterView } = require('../mapper/parameterMapper');
const {
    addNewParameter,
    getAllParameters,
    modifyParameter,
    removeManyParameters,
} = require('../service/parameterService');

const addNewParameterController = async (req, res) => {
    winston.debug('parameterController.addNewParameter -- start');
    const { body, transaction, user } = req;
    const error = validateParameter(body);
    if (error) {
        winston.warn(`parameterController.addNewParameter - ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    const parameter = await addNewParameter(body, user._id, transaction);
    winston.debug('parameterController.addNewParameterAdmin -- success');
    return res.send(mapParameterEntityToParameterView(parameter));
};

const getAllParametersController = async (req, res) => {
    winston.debug('parameterController.getAllParameters -- start');
    const parameters = await getAllParameters();
    winston.debug('parameterController.getAllParameters -- success');
    return res.send(parameters.map(mapParameterEntityToParameterView));
};

const modifyParameterController = async (req, res) => {
    winston.debug('parameterController.updateParameter -- start');
    const { body, params, transaction, user } = req;
    const error = validateParameter(body);
    if (error) {
        winston.warn(`parameterController.updateParameter - ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    const parameter = await modifyParameter(params.id, body, user._id, transaction);
    winston.debug('parameterController.updateParameter -- success');
    return res.send(mapParameterEntityToParameterView(parameter));
};

const removeManyParametersController = async (req, res) => {
    winston.debug('parameterController.removeManyParameters -- start');
    const { body, transaction } = req;
    const error = validateArrayOfObjectIds(body);
    if (error) {
        winston.warn(`parameterController.removeManyParameters - ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    await removeManyParameters(body, transaction);
    winston.debug('parameterController.removeManyParameters -- success');
    return res.send();
};

module.exports = {
    addNewParameterController,
    getAllParametersController,
    modifyParameterController,
    removeManyParametersController,
};
