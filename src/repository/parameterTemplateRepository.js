const winston = require('winston');

const { runQuery } = require('./helper/repositoryHelper');
const ParameterTemplate = require('./models/parameterTemplateModel');

const deleteManyTemplates = async (ids, transaction) => {
    winston.debug('parameterTemplateRepository.deleteManyTemplates -- start');
    if (!ids || !ids.length) {
        winston.warn('parameterTemplateRepository.deleteManyTemplates -- null or empty param');
        return null;
    }
    const queryResult = await runQuery(() =>
        ParameterTemplate.deleteMany({ _id: { $in: ids } }, { session: transaction })
    );
    winston.debug('parameterTemplateRepository.deleteManyTemplates -- success');
    return queryResult;
};

const deleteParametersFromTemplates = async (paramNames, transaction) => {
    winston.debug('parameterTemplateRepository.deleteParametersFromTemplates -- start');
    if (!paramNames || !paramNames.length) {
        winston.warn('parameterTemplateRepository.deleteParametersFromTemplates -- null or empty param');
        return null;
    }
    const queryResult = await runQuery(() =>
        ParameterTemplate.updateMany({}, { $pull: { parameters: { $in: paramNames } } }, { session: transaction })
    );
    winston.debug('parameterTemplateRepository.deleteParametersFromTemplates -- success');
    return queryResult;
};

const findAllTemplates = async transaction => {
    winston.debug('parameterTemplateRepository.findAllTemplates -- start');
    const templates = await runQuery(() => ParameterTemplate.find({}).session(transaction));
    winston.debug('parameterTemplateRepository.findAllTemplates -- success');
    return templates;
};

const findTemplateByName = async (name, transaction) => {
    winston.debug('parameterTemplateRepository.findTemplateByName -- start');
    if (!name) {
        winston.warn('parameterTemplateRepository.findTemplateByName -- null param');
        return null;
    }
    const template = await runQuery(() => ParameterTemplate.findOne({ name }).session(transaction));
    winston.debug('parameterTemplateRepository.findTemplateByName -- success');
    return template;
};

const saveTemplate = async (template, transaction) => {
    winston.debug('parameterTemplateRepository.saveTemplate -- start');
    if (!template) {
        winston.warn('parameterTemplateRepository.saveTemplate -- null param');
        return null;
    }
    const parameterTemplate = new ParameterTemplate(template);
    const savedTemplate = await runQuery(() => parameterTemplate.save({ session: transaction }));
    winston.debug('parameterTemplateRepository.saveTemplate -- success');
    return savedTemplate;
};

const updateParameterInTemplates = async (parameter, newName, transaction) => {
    winston.debug('parameterTemplateRepository.updateParameterInTemplates -- start');
    if (!parameter || !parameter.length || !newName) {
        winston.warn(`parameterTemplateRepository.updateParameterInTemplates -- null param: ${parameter}, ${newName}`);
        return null;
    }
    const queryResult = await runQuery(() =>
        ParameterTemplate.updateMany(
            { parameters: parameter },
            { $set: { 'parameters.$': newName } },
            { session: transaction }
        )
    );
    winston.debug('parameterTemplateRepository.updateParameterInTemplates -- success');
    return queryResult;
};

const updateTemplate = async (id, template, transaction) => {
    winston.debug('parameterTemplateRepository.updateTemplate -- start');
    if (!id || !template) {
        winston.warn(`parameterTemplateRepository.updateTemplate -- null param: ${id}, ${template}`);
        return null;
    }
    const updatedTemplate = await runQuery(() =>
        ParameterTemplate.findByIdAndUpdate(id, template, {
            session: transaction,
        })
    );
    winston.debug('parameterTemplateRepository.updateTemplate -- success');
    return updatedTemplate;
};

module.exports = {
    deleteManyTemplates,
    deleteParametersFromTemplates,
    findAllTemplates,
    findTemplateByName,
    saveTemplate,
    updateParameterInTemplates,
    updateTemplate,
};
