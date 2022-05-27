const winston = require('winston');

const { validateAddNewRole } = require('./validator/roleValidator');
const { BadRequestException } = require('../exceptions');
const { addNewRole } = require('../service/roleService');

const addNewRoleController = async (req, res) => {
    winston.debug('roleController.addNewRole -- start');
    const roleView = req.body;
    const error = validateAddNewRole(roleView);
    if (error) {
        winston.warn(`roleController.addNewRole -- ${error}`);
        throw new BadRequestException(error);
    }
    const roleEntity = await addNewRole(roleView, req.user);
    winston.debug('roleController.addNewRole -- success');
    return res.send(roleEntity);
};

module.exports = {
    addNewRoleController,
};
