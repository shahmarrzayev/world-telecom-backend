const winston = require('winston');

const { validateBranch } = require('./validator/branchValidator');
const { validateArrayOfObjectIds } = require('./validator/commonValidator');
const { BadRequestException } = require('../exceptions');
const { mapBranchEntityToBranchAdminView } = require('../mapper/branchMapper');
const { addNewBranch, getAllBranches, modifyBranch, removeManyBranches } = require('../service/branchService');

/**
 * Add new branch.
 */
const addNewBranchController = async (req, res) => {
    winston.debug('branchController.addNewBranch -- start');
    const { body, user } = req;
    const error = validateBranch(body);
    if (error) {
        winston.warn(`branchValidator.addNewBranch -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    const branchEntity = await addNewBranch(req.body, user._id);
    winston.debug('branchController.addNewBranch -- success');
    return res.send(mapBranchEntityToBranchAdminView(branchEntity));
};

/**
 * Get all branches.
 */
const getAllBranchesController = async (req, res) => {
    winston.debug('branchController.getAllBranches -- start');
    const branchEntities = await getAllBranches();
    winston.debug('branchController.getAllBranches -- success');
    return res.send(branchEntities.map(mapBranchEntityToBranchAdminView));
};

/**
 * Modify branch.
 */
const modifyBranchController = async (req, res) => {
    winston.debug('branchController.modifyBranch -- start');
    const { body, params, user } = req;
    const error = validateBranch(body);
    if (error) {
        winston.warn(`branchValidator.modifyBranch -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    const branchEntity = await modifyBranch(params.id, body, user._id);
    winston.debug('branchController.modifyBranch -- success');
    return res.send(mapBranchEntityToBranchAdminView(branchEntity));
};

/**
 * Remove many branches.
 */
const removeManyBranchesController = async (req, res) => {
    winston.debug('branchController.removeManyBranches -- start');
    const { body } = req;
    const error = validateArrayOfObjectIds(body);
    if (error) {
        winston.warn(`branchValidator.removeManyBranches -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    await removeManyBranches(body);
    winston.debug('branchController.removeManyBranches -- success');
    return res.send();
};

module.exports = {
    addNewBranchController,
    getAllBranchesController,
    modifyBranchController,
    removeManyBranchesController,
};
