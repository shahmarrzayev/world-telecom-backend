const winston = require('winston');

const { validateParameterTemplate } = require('./validator/parameterTemplateValidator');
const { validateArrayOfObjectIds } = require('./validator/commonValidator');
const { BadRequestException } = require('../exceptions');
const { mapTemplateEntityToTemplateView } = require('../mapper/parameterTemplateMapper');
const {
    addNewTemplate,
    deleteTemplates,
    getAllTemplates,
    modifyTemplate,
} = require('../service/parameterTemplateService');

const addNewTemplateController = async (req, res) => {
    winston.debug('parameterTemplateController.addNewTemplate -- start');
    const { body, user } = req;
    const error = validateParameterTemplate(body);
    if (error) {
        winston.warn(`parameterTemplateController.addNewTemplate -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    const parameterTemplate = await addNewTemplate(body, user._id);
    winston.debug('parameterTemplateController.addNewTemplate -- success');
    return res.send(mapTemplateEntityToTemplateView(parameterTemplate));
};

const getAllTemplatesController = async (req, res) => {
    winston.debug('parameterTemplateController.getAllTemplates -- start');
    const parameterTemplates = await getAllTemplates();
    winston.debug('parameterTemplateController.getAllTemplates -- success');
    return res.send(parameterTemplates.map(mapTemplateEntityToTemplateView));
};

const modifyTemplateController = async (req, res) => {
    winston.debug('parameterTemplateController.modifyTemplate -- start');
    const { body, params, user } = req;
    const error = validateParameterTemplate(body);
    if (error) {
        winston.warn(`parameterTemplateController.modifyTemplate -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    const parameterTemplate = await modifyTemplate(params.id, body, user._id);
    winston.debug('parameterTemplateController.modifyTemplate -- success');
    return res.send(mapTemplateEntityToTemplateView(parameterTemplate));
};

const removeManyParameterTemplatesController = async (req, res) => {
    winston.debug('parameterTemplateController.removeManyParameterTemplates -- start');
    const { body } = req;
    const error = validateArrayOfObjectIds(body);
    if (error) {
        winston.warn(`parameterTemplateController.removeManyParameterTemplates -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    await deleteTemplates(req.body);
    winston.debug('parameterTemplateController.removeManyParameterTemplates -- success');
    return res.send();
};

module.exports = {
    addNewTemplateController,
    getAllTemplatesController,
    modifyTemplateController,
    removeManyParameterTemplatesController,
};
