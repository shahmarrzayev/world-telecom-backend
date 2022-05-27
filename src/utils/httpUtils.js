const axios = require('axios');
const winston = require('winston');

const { GeneralException } = require('../exceptions');

const getRequest = async (url, headers) => {
    winston.debug('httpUtils.getRequest -- start');
    let response;
    try {
        response = await axios.get(url, { headers, timeout: 10000 });
    } catch (error) {
        winston.error(`httpUtils.getRequest -- ${error}`);
        throw new GeneralException(error);
    }
    winston.debug('httpUtils.getRequest -- success');
    return response ? response.data : null;
};

const postRequest = async (url, body, headers, httpsAgent) => {
    winston.debug('httpUtils.postRequest -- start');
    let response;
    try {
        response = await axios.post(url, body, { headers, httpsAgent, timeout: 10000 });
    } catch (error) {
        winston.error(`httpUtils.postRequest -- ${JSON.stringify(error)}`);
        throw new GeneralException(error);
    }
    winston.debug('httpUtils.postRequest -- success');
    return response ? response.data : null;
};

module.exports = {
    getRequest,
    postRequest,
};
