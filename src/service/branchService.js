const winston = require('winston');

const { Cache } = require('../enums');
const { ConflictException, GeneralException, NotFoundException } = require('../exceptions');
const {
    deleteManyBranches,
    findAllBranches,
    findBranchByName,
    saveBranch,
    updateBranch,
} = require('../repository/branchRepository');
const { flushCache, getFromCache, setInCache } = require('../utils/cacheUtils');

/**
 * Add new branch.
 * @param {BranchView} branch
 * @param {String} userId
 * @returns {Promise<BranchEntity>}
 */
const addNewBranch = async (branch, userId) => {
    winston.debug('branchService.addNewBranch -- start');
    if (!branch || !userId) {
        winston.error(`branchService.addNewBranch -- null param: ${branch}, ${userId}`);
        throw new GeneralException();
    }

    const branchWithNameExists = await findBranchByName(branch.name);
    if (branchWithNameExists) {
        winston.warn('branchService.addNewBranch -- branch already exists');
        throw new ConflictException('Bu adda ofis artıq mövcüddur');
    }

    branch.createdBy = userId;
    const branchEntity = await saveBranch(branch);
    if (!branchEntity) {
        winston.warn('branchService.addNewBranch -- could not save branch');
        throw new GeneralException();
    }

    flushCache();
    winston.debug('branchService.addNewBranch -- success');
    return branchEntity;
};

/**
 * Get all branches.
 * @returns {Promise<Array<BranchEntity>>}
 */
const getAllBranches = async () => {
    winston.debug('branchService.getAllBranches -- start');
    let branches = getFromCache(Cache.BRANCHES);
    if (branches) return branches;

    branches = await findAllBranches();
    if (!branches) {
        winston.warn('branchService.getAllBranches -- could not get branches');
        throw new GeneralException();
    }
    setInCache(Cache.BRANCHES, branches);
    winston.debug('branchService.getAllBranches -- success');
    return branches;
};

/**
 * Update branch.
 * @param {String} id
 * @param {BranchView} branch
 * @param {String} userId
 * @returns {Promise<BranchEntity>}
 */
const modifyBranch = async (id, branch, userId) => {
    winston.debug('branchService.modifyBranch -- start');
    if (!id || !branch || !userId) {
        winston.error(`branchService.modifyBranch -- null param: ${id}, ${branch}, ${userId}`);
        throw new GeneralException();
    }

    branch.updatedBy = userId;
    const branchEntity = await updateBranch(id, branch);
    if (!branchEntity) {
        winston.warn('branchService.modifyBranch -- branch not found');
        throw new NotFoundException('Ofis tapılmadı');
    }

    flushCache();
    winston.debug('branchService.modifyBranch -- success');
    return branchEntity;
};

/**
 * Delete many branches by ids.
 * @param {Array<String>} branchIds
 */
const removeManyBranches = async branchIds => {
    winston.debug('branchService.removeManyBranches -- start');
    if (!branchIds || !branchIds.length) {
        winston.error(`branchService.removeManyBranches -- unexpected param: ${branchIds}`);
        throw new GeneralException();
    }

    const branchesDeleted = await deleteManyBranches(branchIds);
    if (!branchesDeleted) {
        winston.warn('branchService.removeManyBranches -- could not remove branches');
        throw new GeneralException();
    }

    flushCache();
    winston.debug('branchService.removeManyBranches -- success');
};

module.exports = {
    addNewBranch,
    getAllBranches,
    modifyBranch,
    removeManyBranches,
};
