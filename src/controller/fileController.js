const winston = require('winston');

const {
    generateProductsFile,
    generateProductParamsFile,
    generateXmlFeedsFile,
    parseOneSPricesFile,
    processNumbersFile,
    processProductOptionIdToOneSIdMappingFile,
    processManyProductOptionsFromFile,
    processCampaignsFile,
    uploadFileToStorage,
} = require('../service/fileService');
const { assignOneSPricesToProductOptions } = require('../service/productService');

/**
 * Generate products file.
 */
const generateProductsFileController = async (req, res) => {
    winston.debug('fileController.generateProductsFile -- start');
    await generateProductsFile();
    winston.debug('fileController.generateProductsFile -- success');
    return res.send();
};

/**
 * Generate product params file.
 */
const generateProductParamsFileController = async (req, res) => {
    winston.debug('fileController.generateProductParamsFile -- start');
    await generateProductParamsFile();
    winston.debug('fileController.generateProductParamsFile -- success');
    return res.send();
};

/**
 * Generate xml product feed.
 */
const generateXmlFeedsFileController = async (req, res) => {
    winston.debug('fileController.generateXmlFeedsFile -- start');
    await generateXmlFeedsFile();
    winston.debug('fileController.generateXmlFeedsFile -- success');
    return res.send();
};

/**
 * Process numbers file (add numbers).
 */
const processNumbersFileController = async (req, res) => {
    winston.debug('fileController.processNumbersFile -- start');
    await processNumbersFile(req.file, req.user._id, req.transaction);
    winston.debug('fileController.processNumbersFile -- success');
    return res.send();
};

/**
 * Process one s prices file.
 */
const processOneSPricesFileController = async (req, res) => {
    winston.debug('fileController.processOneSPricesFile -- start');
    const oneSIdToPrices = parseOneSPricesFile(req.file);
    await assignOneSPricesToProductOptions(oneSIdToPrices, req.transaction);
    winston.debug('fileController.processOneSPricesFile -- success');
    return res.send();
};

/**
 * Process product option id to one s id mapping file.
 */
const processProductOptionIdToOneSIdMappingFileController = async (req, res) => {
    winston.debug('fileController.processProductOptionIdToOneSIdMappingFile -- start');
    await processProductOptionIdToOneSIdMappingFile(req.file, req.transaction);
    winston.debug('fileController.processProductOptionIdToOneSIdMappingFile -- start');
    return res.send();
};

/**
 * Upload file to digital ocean storage.
 */
const uploadFileToStorageController = async (req, res) => {
    winston.debug('fileController.uploadFileToStorage -- start');
    const result = await uploadFileToStorage(req.file);
    winston.debug('fileController.uploadFileToStorage -- start');
    return res.send(result);
};


/**
 * Process product option from excel file.
 */

const processManyProductOptionsFromFileController = async (req, res) => {
    winston.debug('fileController.processManyProductOptionsFromFileController -- start');
    await processManyProductOptionsFromFile(req.file, req.user._id, req.transaction);
    winston.debug('fileController.processManyProductOptionsFromFileController -- success');
    return res.send();
}

/**
 * Process campaigns to product options from excel file
 */

const processCampaignsFileController = async (req, res) => {
    winston.debug('fileController.processCampaignsToProductOptionsFileController -- start');
    await processCampaignsFile(req.file, req.user._id, req.transaction);
    winston.debug('fileController.processCampaignsToProductOptionsFileController -- success');
    return res.send();
}

module.exports = {
    generateProductsFileController,
    generateProductParamsFileController,
    generateXmlFeedsFileController,
    processNumbersFileController,
    processOneSPricesFileController,
    processProductOptionIdToOneSIdMappingFileController,
    processManyProductOptionsFromFileController,
    processCampaignsFileController,
    uploadFileToStorageController
};
