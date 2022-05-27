const winston = require('winston');

const { runQuery } = require('./helper/repositoryHelper');
const Branch = require('./models/branchModel');

const deleteManyBranches = async (ids, transaction) => {
    winston.debug('branchRepository.deleteManyBranches -- start');
    if (!ids || !ids.length) {
        winston.warn('branchRepository.deleteManyBranches -- null or empty param');
        return null;
    }
    const queryResult = await runQuery(() => Branch.deleteMany({ _id: { $in: ids } }, { session: transaction }));
    winston.debug('branchRepository.deleteManyBranches -- success');
    return queryResult;
};

const findAllBranches = async transaction => {
    winston.debug('branchRepository.findAllBranches -- start');
    const branches = await runQuery(() =>
        Branch.find()
            .sort('order')
            .session(transaction)
    );
    winston.debug('branchRepository.findAllBranches -- success');
    return branches;
};

const findBranchByName = async (name, transaction) => {
    winston.debug('branchRepository.findBranchByName -- start');
    if (!name) {
        winston.warn('branchRepository.findBranchByName -- null param');
        return null;
    }
    const branch = await runQuery(() => Branch.findOne({ name }).session(transaction));
    winston.debug('branchRepository.findBranchByName -- success');
    return branch;
};

const saveBranch = async (branch, transaction) => {
    winston.debug('branchRepository.saveBranch -- start');
    if (!branch) {
        winston.warn('branchRepository.saveBranch -- null param');
        return null;
    }
    const dbBranch = new Branch(branch);
    const branchEntity = await runQuery(() => dbBranch.save({ session: transaction }));
    winston.debug('branchRepository.saveBranch -- success');
    return branchEntity;
};

const updateBranch = async (id, branch, transaction) => {
    winston.debug('branchRepository.updateBranch -- start');
    if (!id || !branch) {
        winston.warn(`branchRepository.updateBranch -- null param: ${id}, ${branch}`);
        return null;
    }
    const branchEntity = await runQuery(() =>
        Branch.findByIdAndUpdate(id, branch, {
            new: true,
            session: transaction,
            useFindAndModify: false,
        })
    );
    winston.debug('branchRepository.updateBranch -- success');
    return branchEntity;
};

module.exports = {
    deleteManyBranches,
    findAllBranches,
    findBranchByName,
    saveBranch,
    updateBranch,
};
