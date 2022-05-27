const winston = require('winston');

const { validateLoan } = require('./validator/loanValidator');
const { validateArrayOfObjectIds } = require('./validator/commonValidator');
const { BadRequestException } = require('../exceptions');
const { mapLoanEntityToLoanViewAdmin } = require('../mapper/loanMapper');
const { addNewLoan, getAllLoans, modifyLoan, removeManyLoans } = require('../service/loanService');

const addNewLoanController = async (req, res) => {
    winston.debug('loanController.addNewLoan -- start');
    const { body, transaction, user } = req;
    const error = validateLoan(body);
    if (error) {
        winston.warn(`loanController.addNewLoan -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    const loanEntity = await addNewLoan(body, user._id, transaction);
    winston.debug('loanController.addNewLoan -- success');
    return res.send(mapLoanEntityToLoanViewAdmin(loanEntity));
};

const getAllLoansController = async (req, res) => {
    winston.debug('loanController.getAllLoans -- start');
    const loans = await getAllLoans();
    winston.debug('loanController.getAllLoans -- success');
    return res.send(loans.map(mapLoanEntityToLoanViewAdmin));
};

const modifyLoanController = async (req, res) => {
    winston.debug('loanController.modifyLoan -- start');
    const { body, params, user, transaction } = req;
    const error = validateLoan(body);
    if (error) {
        winston.warn(`loanController.modifyLoan -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    const loanEntity = await modifyLoan(params.id, body, user._id, transaction);
    winston.debug('loanController.modifyLoan -- success');
    return res.send(mapLoanEntityToLoanViewAdmin(loanEntity));
};

const removeManyLoansController = async (req, res) => {
    winston.debug('loanController.removeManyLoans -- start');
    const { body, transaction } = req;
    const error = validateArrayOfObjectIds(body);
    if (error) {
        winston.warn(`loanController.removeManyLoans -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    await removeManyLoans(body, transaction);
    winston.debug('loanController.removeManyLoans -- success');
    return res.send();
};

module.exports = {
    addNewLoanController,
    getAllLoansController,
    modifyLoanController,
    removeManyLoansController,
};
