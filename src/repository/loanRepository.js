const winston = require('winston');

const { runQuery } = require('./helper/repositoryHelper');
const Loan = require('./models/loanModel');

const deleteManyLoans = async (ids, transaction) => {
    winston.debug('loanRepository.deleteManyLoans -- start');
    if (!ids || !ids.length) {
        winston.warn('loanRepository.deleteManyLoans -- null or empty param');
        return null;
    } 
    const queryResult = await runQuery(() => Loan.deleteMany({ _id: { $in: ids } }, { session: transaction }));
    winston.debug('loanRepository.deleteManyLoans -- success');
    return queryResult;
};

const findAllLoans = async transaction => {
    winston.debug('loanRepository.findAllLoans -- start');
    const loans = await runQuery(() => Loan.find().session(transaction));
    winston.debug('loanRepository.findAllLoans -- success');
    return loans;
};

const findLoanByTitle = async (title, transaction) => {
    winston.debug('loanRepository.findLoanByTitle -- start');
    if (!title) {
        winston.warn('loanRepository.findLoanByTitle -- null param');
        return null;
    }
    const loan = await runQuery(() => Loan.findOne({ title }).session(transaction));
    winston.debug('loanRepository.findLoanByTitle -- success');
    return loan;
};

const findLoansInIds = async (ids, transaction) => {
    winston.debug('loanRepository.findLoansInIds -- start');
    if (!ids || !ids.length) {
        winston.warn('loanRepository.findLoansInIds -- null or empty param');
        return null;
    }
    const loans = await runQuery(() => Loan.find({ _id: { $in: ids } }).session(transaction));
    winston.debug('loanRepository.findLoansInIds -- success');
    return loans;
};

const saveLoan = async (loan, transaction) => {
    winston.debug('loanRepository.saveLoan -- start');
    if (!loan) {
        winston.warn('loanRepository.saveLoan -- null param');
        return null;
    }
    const dbLoan = new Loan(loan);
    const loanEntity = await runQuery(() => dbLoan.save({ session: transaction }));
    winston.debug('loanRepository.saveLoan -- success');
    return loanEntity;
};

const updateLoan = async (id, loan, transaction) => {
    winston.debug('loanRepository.updateLoan -- start');
    if (!id || !loan) {
        winston.warn(`loanRepository.updateLoan -- null param: ${id}, ${loan}`);
        return null;
    }
    const loanEntity = await runQuery(() =>
        Loan.findOneAndUpdate({ _id: id }, loan, {
            new: true,
            session: transaction,
            useFindAndModify: false,
        })
    );
    winston.debug('loanRepository.updateLoan -- success');
    return loanEntity;
};

module.exports = {
    deleteManyLoans,
    findAllLoans,
    findLoanByTitle,
    findLoansInIds,
    saveLoan,
    updateLoan,
};
