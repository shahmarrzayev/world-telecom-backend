const mongoose = require('mongoose');
const onFinished = require('on-finished');
const winston = require('winston');

module.exports = async (req, res, next) => {
    winston.debug('transactionMw -- starting transaction');
    let session = null;
    try {
        session = await mongoose.startSession();
        session.startTransaction();
        req.transaction = session;
    } catch (error) {
        winston.error(`transactionMw -- ${JSON.stringify(error)}`);
        throw new Error();
    }

    // eslint-disable-next-line no-shadow
    onFinished(res, (err, res) => {
        winston.debug('transactionMw.onFinished -- start');
        if (err || (res.statusCode && res.statusCode >= 400)) {
            winston.debug('transactionMw -- aborting transaction');
            session.abortTransaction();
        } else {
            winston.debug('transactionMw -- comitting transaction');
            session.commitTransaction();
        }
    });
    next();
};
