const winston = require('winston');

const { validateLoanRequest } = require('./validator/loanRequestValidator');
const { BadRequestException } = require('../exceptions');
const { mapLoanRequestEntityToLoanRequestView } = require('../mapper/loanRequestMapper');
const {
    addNewLoanRequest,
    approveLoanRequest,
    closeLoanRequest,
    getLoanRequestById,
    getManyLoanRequests,
} = require('../service/loanRequestService');

const addNewLoanRequestController = async (req, res) => {
    winston.debug('loanRequestController.addNewLoanRequest -- start');
    const { body, transaction } = req;
    const error = validateLoanRequest(body);
    if (error) {
        winston.warn(`loanRequestController.addNewLoanRequest -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    const loanRequest = await addNewLoanRequest(body, transaction);
    winston.debug('loanRequestController.addNewLoanRequest -- success');
    return res.send(mapLoanRequestEntityToLoanRequestView(loanRequest));
};

const approveLoanRequestController = async (req, res) => {
    winston.debug('loanRequestController.approveLoanRequest -- start');
    await approveLoanRequest(req.params.id);
    winston.debug('loanRequestController.approveLoanRequest -- success');
    return res.send();
};

const closeLoanRequestController = async (req, res) => {
    winston.debug('loanRequestController.closeLoanRequest -- start');
    await closeLoanRequest(req.params.id);
    winston.debug('loanRequestController.closeLoanRequest -- success');
    return res.send();
};

const getLoanRequestByIdController = async (req, res) => {
    winston.debug('loanRequestController.getLoanRequestByIdController -- start');
    const loanRequestEntity = await getLoanRequestById(req.params.id);
    winston.debug('loanRequestController.getLoanRequestByIdController -- success');
    return res.send(mapLoanRequestEntityToLoanRequestView(loanRequestEntity));
};

const getManyLoanRequestsController = async (req, res) => {
    winston.debug('loanRequestController.getManyLoanRequests -- start');
    const response = await getManyLoanRequests(req.query);
    response.loanRequests = response.loanRequests.map(mapLoanRequestEntityToLoanRequestView);
    winston.debug('loanRequestController.getManyLoanRequests -- success');
    return res.send(response);
};

module.exports = {
    addNewLoanRequestController,
    approveLoanRequestController,
    closeLoanRequestController,
    getLoanRequestByIdController,
    getManyLoanRequestsController,
};
