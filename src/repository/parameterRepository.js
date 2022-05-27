const winston = require('winston');

const { runQuery } = require('./helper/repositoryHelper');
const Parameter = require('./models/parameterModel');

const deleteManyParameters = async (ids, transaction) => {
    winston.debug('parameterRepository.deleteManyParameters -- start');
    if (!ids || !ids.length) {
        winston.warn('parameterRepository.deleteManyParameters -- null param');
        return null;
    }
    const queryResult = await runQuery(() => Parameter.deleteMany({ _id: { $in: ids } }, { session: transaction }));
    winston.debug('parameterRepository.deleteManyParameters -- success');
    return queryResult;
};

const findAllParameters = async transaction => {
    winston.debug('parameterRepository.findAllParameters -- start');
    const parameters = await runQuery(() => Parameter.find({}).session(transaction));
    winston.debug('parameterRepository.findAllParameters -- success');
    return parameters;
};

const findParameterByName = async (name, transaction) => {
    winston.debug('parameterRepository.findParameterByName -- start');
    if (!name) {
        winston.warn('parameterRepository.findParameterByName -- null param');
        return null;
    }
    const parameter = await runQuery(() => Parameter.findOne({ name }).session(transaction));
    winston.debug('parameterRepository.findParameterByName -- success');
    return parameter;
};

const findParameterById = async (id, transaction) => {
    winston.debug('parameterRepository.findParameterById -- start');
    if (!id) {
        winston.warn('parameterRepository.findParameterById -- null param');
        return null;
    }
    const param = await runQuery(() => Parameter.findById(id).session(transaction));
    winston.debug('parameterRepository.findParameterById -- success');
    return param;
};

const findParametersByIds = async (ids, transaction) => {
    winston.debug('parameterRepository.findParametersByIds -- start');
    if (!ids || !ids.length) {
        winston.warn('parameterRepository.findParametersByIds -- null param');
        return null;
    }
    const parameters = await runQuery(() => Parameter.find({ _id: { $in: ids } }).session(transaction));
    winston.debug('parameterRepository.findParametersByIds -- success');
    return parameters;
};

const saveParameter = async (parameter, transaction) => {
    winston.debug('parameterRepository.saveParameter -- start');
    if (!parameter) {
        winston.warn('parameterRepository.saveParameter -- null param');
        return null;
    }
    const dbParameter = new Parameter(parameter);
    const savedParameter = await runQuery(() => dbParameter.save({ session: transaction }));
    winston.debug('parameterRepository.saveParameter -- success');
    return savedParameter;
};

const updateParameter = async (id, parameter, transaction) => {
    winston.debug('parameterRepository.updateParameter -- start');
    if (!id || !parameter) {
        winston.warn(`parameterRepository.updateParameter -- null param: ${id}, ${parameter}`);
        return null;
    }
    const updatedParameter = await runQuery(() =>
        Parameter.findOneAndUpdate(
            { _id: id },
            { name: parameter.name },
            { new: true, useFindAndModify: false }
        ).session(transaction)
    );
    winston.debug('parameterRepository.updateParameter -- success');
    return updatedParameter;
};

module.exports = {
    deleteManyParameters,
    findAllParameters,
    findParameterByName,
    findParameterById,
    findParametersByIds,
    saveParameter,
    updateParameter,
};
