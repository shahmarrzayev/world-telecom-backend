const winston = require('winston');

const { ConflictException, GeneralException, NotFoundException } = require('../exceptions');
const { mapTemplateViewToTemplateEntity } = require('../mapper/parameterTemplateMapper');
const {
    deleteManyTemplates,
    findAllTemplates,
    findTemplateByName,
    saveTemplate,
    updateTemplate,
} = require('../repository/parameterTemplateRepository');

/**
 * Add new parameter template.
 * @param {ParameterTemplateView} templateView
 * @param {String} userId
 * c
 */
const addNewTemplate = async (templateView, userId) => {
    winston.debug('parameterTemplateService.addNewTemplate -- start');
    if (!templateView || !userId) {
        winston.warn(`parameterTemplateService.addNewTemplate -- null param: ${templateView}, ${userId}`);
        throw new GeneralException();
    }

    const template = mapTemplateViewToTemplateEntity(templateView);
    const dbTemplate = await findTemplateByName(template.name);
    if (dbTemplate) {
        winston.warn('parameterTemplateService.addNewTemplate -- template exists');
        throw new ConflictException('Template wish such name exists');
    }
    template.createdBy = userId;
    const templateEntity = await saveTemplate(template);
    if (!templateEntity) {
        winston.warn('parameterTemplateService.addNewTemplate -- could not save template');
        throw new GeneralException();
    }
    winston.debug('parameterTemplateService.addNewTemplate -- success');
    return templateEntity;
};

/**
 * Get all parameter templates.
 * @returns {Promise<Array<ParameterTemplateEntity>>}
 */
const getAllTemplates = async () => {
    winston.debug('parameterTemplateService.getAllTemplates -- start');
    const templates = await findAllTemplates();
    if (!templates) {
        winston.warn('parameterTemplateService.getAllTemplates -- could not get templates');
        throw new GeneralException();
    }
    winston.debug('parameterTemplateService.getAllTemplates -- success');
    return templates;
};

/**
 * Update parameter template.
 * @param {String} id
 * @param {ParameterTemplateView} templateView
 * @param {String} userId
 * @returns {Promise<ParameterTemplateEntity>}
 */
const modifyTemplate = async (id, templateView, userId) => {
    winston.debug('parameterTemplateService.modifyTemplate -- start');
    if (!id || !templateView || !userId) {
        winston.warn('parameterTemplateService.modifyTemplate -- null param');
        throw new GeneralException();
    }

    const template = mapTemplateViewToTemplateEntity(templateView);
    template.updatedBy = userId;
    const templateEntity = await updateTemplate(id, template);
    if (!templateEntity) {
        winston.warn('parameterTemplateService.modifyTemplate -- template not found');
        throw new NotFoundException('Template not found');
    }

    winston.debug('parameterTemplateService.modifyTemplate -- success');
    return templateEntity;
};

/**
 * Delete many parameter templates.
 * @param {Array<String>} templateIds
 */
const removeManyParameterTemplates = async ids => {
    winston.debug('parameterTemplateService.removeManyParameterTemplates -- start');
    if (!ids || !ids.length) {
        winston.warn('parameterTemplateService.removeManyParameterTemplates -- null or empty param');
        throw new GeneralException();
    }

    const templatesDeleted = await deleteManyTemplates(ids);
    if (!templatesDeleted) {
        winston.warn('parameterTemplateService.removeManyParameterTemplates -- could not remove templates');
        throw new GeneralException();
    }
    winston.debug('parameterTemplateService.removeManyParameterTemplates -- success');
};

module.exports = {
    addNewTemplate,
    getAllTemplates,
    modifyTemplate,
    removeManyParameterTemplates,
};
