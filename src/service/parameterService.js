const winston = require('winston');

const { ConflictException, NotFoundException, GeneralException } = require('../exceptions');
const { mapParameterViewToParameterEntity } = require('../mapper/parameterMapper');
const {
    deleteManyParameters,
    findAllParameters,
    findParameterByName,
    findParameterById,
    findParametersByIds,
    saveParameter,
    updateParameter,
} = require('../repository/parameterRepository');
const {
    deleteParametersFromTemplates,
    updateParameterInTemplates,
} = require('../repository/parameterTemplateRepository');
const {
    deleteParamatersFromProductOptions,
    updateParameterInProductOption,
} = require('../repository/productOptionRepository');

/**
 * Add new parameter.
 * @param {ParameterView} parameterView
 * @param {String} userId
 * @param {Transaction} transaction
 * @returns {Promise<ParameterEntity>}
 */
const addNewParameter = async (parameterView, userId, transaction) => {
    winston.debug('parameterService.addNewParameter -- start');
    if (!parameterView || !userId) {
        winston.warn(`parameterService.addNewParameter -- null param: ${parameterView}, ${userId}`);
        throw new GeneralException();
    }

    const paramNameExists = await findParameterByName(parameterView.name);
    if (paramNameExists) {
        winston.warn('parameterService.addNewParameter -- parameter with such name exists');
        throw new ConflictException('Parameter mövcüddur');
    }

    let parameterEntity = mapParameterViewToParameterEntity(parameterView);
    parameterEntity.createdBy = userId;
    parameterEntity = await saveParameter(parameterEntity, transaction);
    if (!parameterEntity) {
        winston.warn('parameterService.addNewParameter -- could not save parameter');
        throw new GeneralException();
    }
    winston.debug('parameterService.addNewParameterAdmin -- success');
    return parameterEntity;
};

/**
 * Get all parameters.
 * @returns {Promise<Array<ParameterEntity>>}
 */
const getAllParameters = async () => {
    winston.debug('parameterService.getAllParameters -- start');
    const parameters = await findAllParameters();
    if (!parameters) {
        winston.warn('parameterService.getAllParameters -- could not get parameters');
        throw new GeneralException();
    }
    winston.debug('parameterService.getAllParameters -- success');
    return parameters;
};

/**
 * Update parameter.
 * @param {String} id
 * @param {ParameterView} parameterView
 * @param {String} userId
 * @param {Transaction} transaction
 * @returns {Promise<ParameterEntity>}
 */
const modifyParameter = async (id, parameterView, userId, transaction) => {
    winston.debug('parameterService.modifyParameter -- start');
    if (!id || !parameterView || !userId) {
        winston.warn(`parameterService.modifyParameter -- null param: ${id}, ${parameterView}, ${userId}`);
        throw new GeneralException();
    }

    if (id === '5e7c751a737da00007503ed6') {
        winston.warn('parameterService.modifyParameter -- cannot change the parameter');
        throw new ConflictException('Bu parametri dəyişmək sistemdə problemlər çıxara bilər. Fuadla əlaqə saxlayın.');
    }

    const dbParameter = await findParameterById(id);
    if (!dbParameter) {
        winston.warn(`parameterService.modifyParameter -- parameter not found`);
        throw new NotFoundException('Parameter not found');
    }

    let parameterEntity = mapParameterViewToParameterEntity(parameterView);
    parameterEntity.updatedBy = userId;
    parameterEntity = await updateParameter(id, parameterEntity, transaction);
    if (!parameterEntity) {
        winston.warn('parameterService.modifyParameter -- could not update parameter');
        throw new GeneralException();
    }

    const paramUpdatedTemplates = await updateParameterInTemplates(dbParameter.name, parameterEntity.name, transaction);
    if (!paramUpdatedTemplates) {
        winston.warn('parameterService.modifyParameter -- could not update parameter in templates');
        throw new GeneralException();
    }
    const paramUpdatedInPO = await updateParameterInProductOption(dbParameter.name, parameterEntity.name, transaction);
    if (!paramUpdatedInPO) {
        winston.warn('parameterService.modifyParameter -- could not update parameter in product options');
        throw new GeneralException();
    }
    winston.debug('parameterService.modifyParameter -- success');
    return parameterEntity;
};

/**
 * Delete parameter by its id.
 * @param {Array<String>} parameterIds
 * @param {Transaction} transaction
 */
const removeManyParameters = async (parameterIds, transaction) => {
    winston.debug('parameterService.deleteManyParameters -- start');
    if (!parameterIds || !parameterIds.length) {
        winston.warn('parameterService.deleteManyParameters -- null or empty param');
        throw new GeneralException();
    }

    const parameters = await findParametersByIds(parameterIds);
    if (parameters.length !== parameterIds.length) {
        winston.warn('parameterService.deleteManyParameters -- parameter not found');
        throw new NotFoundException('Parameter not found');
    }

    const parameterNames = parameters.map(p => p.name);

    const [paramsDeleted, deletedTemplates, deletedInPO] = await Promise.all([
        deleteManyParameters(parameterIds, transaction),
        deleteParametersFromTemplates(parameterNames, transaction),
        deleteParamatersFromProductOptions(parameterNames, transaction),
    ]);

    if (!paramsDeleted || !deletedTemplates || !deletedInPO) {
        winston.warn('parameterService.deleteManyParameters -- could not delete parameters');
        throw new GeneralException();
    }
    winston.debug('parameterService.deleteManyParameters -- success');
};

module.exports = {
    addNewParameter,
    getAllParameters,
    modifyParameter,
    removeManyParameters,
};
