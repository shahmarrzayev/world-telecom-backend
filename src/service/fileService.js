const winston = require('winston');
const { isArray, flatten, uniq } = require('lodash');

const {
    generateExcelFile,
    generateXmlFeedsBuffer,
    parseExcelFile,
    parseNumberExcelFile,
    parseOneSIdMappingFile,
    parseProductOptionExcelFile,
    parseCampaignsExcelFile,
    assignRowsToProductOption
} = require('./helper/fileHelper');
const { uploadFileToSpaces } = require('../client/storageClient');
const { MEMORY_PARAM } = require('../constants');
const { GeneralException } = require('../exceptions');
const {
    findAllProductOptions,
    findProductOptionsByIds,
    updateProductOption,
    findProductOptionsByOneSIds,
} = require('../repository/productOptionRepository');
const { addManyNumbers } = require('../service/numberService');

const { getAllLoans } = require('./loanService');
const { flushCache } = require('../utils/cacheUtils');
const { findCampaignByName } = require('../repository/campaignRepository');
const { addNewCampaign, modifyCampaign } = require('./campaignService');

/**
 * Generates excel file with product information.
 */
const generateProductsFile = async () => {
    winston.debug('fileService.generateProductsFile -- start');
    const allOptions = await findAllProductOptions();
    if (!allOptions || !allOptions.length) {
        winston.warn('fileService.generateProductsFile -- could not get products');
        throw new GeneralException();
    }

    const data = [];
    data.push([
        'ID',
        '1S ID',
        'BRAND',
        'MODEL',
        'IDENTIFICATOR',
        'PRICE',
        'DISCOUNTED PRICE',
        'CATEGORIES',
        'MEMORY',
        'COLOR',
        'SELLING STATUS',
    ]);
    allOptions.forEach(option => {
        let memory =
            option.parameters && option.parameters.length ? option.parameters.find(p => p.name === MEMORY_PARAM) : '';
        memory = memory ? memory.value : '';
        const row = [
            option._id,
            option.oneSId,
            option.product.manufacturer,
            option.product.model,
            option.identificator,
            `${option.price} AZN`,
            option.discount && option.discount.price ? `${option.discount.price} AZN` : '',
            option.product.categories,
            memory || '',
            option.color,
        ];
        row.push(option.published ? 'ONLINE' : 'OFFLINE');
        if (option.loanOptions && option.loanOptions.length) {
            option.loanOptions.forEach(l => {
                row.push(`${l.price} AZN - ${l.period} ay`);
            });
        }
        data.push(row);
    });

    const buffer = generateExcelFile(data, 'w-t-all-products');
    if (!buffer) {
        winston.warn('fileService.generateProductsFile -- could not generate file');
        throw new GeneralException();
    }

    await uploadFileToSpaces('w-t-all-products.xlsx', buffer, true);
    flushCache();
    winston.debug('fileService.generateProductsFile -- success');
};

/**
 * Generates excel file with product parameter information.
 */
const generateProductParamsFile = async () => {
    winston.debug('fileService.generateProductParamsFile -- start');
    const allOptions = await findAllProductOptions();
    if (!allOptions) {
        winston.warn('fileService.generateProductParamsFile -- could not get products');
        throw new GeneralException();
    }

    const data = [];
    allOptions.forEach(option => {
        if (option.parameters && option.parameters.length) {
            const row = [
                `${option.product.manufacturer} ${option.product.model} ${option.product.identificator || ''}`,
                option.product.categories,
            ];
            option.parameters.forEach(p => row.push(`${p.name}: ${p.value}`));
            data.push(row);
        }
    });

    const buffer = generateExcelFile(data, 'w-t-all-products-params', true);
    if (!buffer) {
        winston.warn('fileService.generateProductParamsFile -- could not generate file');
        throw new GeneralException();
    }

    await uploadFileToSpaces('w-t-all-products-params.xlsx', buffer, true);
    flushCache();
    winston.debug('fileService.generateProductParamsFile -- success');
};

/**
 * Generate XML product feed file.
 */
const generateXmlFeedsFile = async () => {
    winston.debug('fileService.generateXmlFeedsFile -- start');
    const productOptions = await findAllProductOptions();
    if (!isArray(productOptions)) {
        winston.error('fileService.generateXmlFeedsFile -- could not get products');
        throw new GeneralException();
    }

    const buffer = generateXmlFeedsBuffer(productOptions.filter(p => p.published));
    if (!buffer) {
        winston.error('fileService.generateXmlFeedsFile -- could not generate buffer');
        throw new GeneralException();
    }

    await uploadFileToSpaces('product-feed.xml', buffer, true);
    flushCache();
    winston.debug('fileService.generateXmlFeedsFile -- success');
};

/**
 * Parses oneS prices file.
 * @param {File} file
 * @returns {Array{OneSIdToPrices}}
 */
const parseOneSPricesFile = file => {
    winston.debug('fileService.parseOneSPricesFile -- start');
    if (!file) {
        winston.warn('fileService.parseOneSPricesFile -- null param');
        throw new GeneralException();
    }

    const oneSIdToPrices = [];
    try {
        const data = parseExcelFile(file);
        data.forEach(row => {
            if (!row || row.length < 6) return;

            oneSIdToPrices.push({
                oneSId: row[0],
                price: row[2],
                discountedPrice: row[3],
                loan12Months: row[4],
                loan18Months: row[5],
            });
        });
    } catch (error) {
        winston.error(`fileService.parseOneSPricesFile -- ${JSON.stringify(error)}`);
        throw new GeneralException(error.message);
    }
    flushCache();
    winston.debug('fileService.parseOneSPricesFile -- success');
    return oneSIdToPrices;
};

/**
 * Process numbers excel file (parse and save).
 * @param {File} file
 * @param {String} userId
 * @param {Transaction} transaction
 */
const processNumbersFile = async (file, userId, transaction) => {
    winston.debug('fileService.processNumbersFile -- start');
    if (!file || !userId) {
        winston.warn(`fileService.processNumbersFile -- null param: ${file}, ${userId}`);
        throw new GeneralException();
    }

    const numbers = parseNumberExcelFile(file, userId);
    await addManyNumbers(numbers, transaction);
    flushCache();
    winston.debug('fileService.processNumbersFile -- success');
};

/**
 * Assigns oneS ids to product options.
 * @param {File} file
 * @param {Transaction} transaction
 */
const processProductOptionIdToOneSIdMappingFile = async (file, transaction) => {
    winston.debug('fileService.processProductOptionIdToOneSIdMappingFile -- start');
    if (!file) {
        winston.warn('fileService.processProductOptionIdToOneSIdMappingFile -- null param');
        throw new GeneralException();
    }

    const productOptionIdToOneSId = parseOneSIdMappingFile(file);
    if (!productOptionIdToOneSId || !productOptionIdToOneSId.length) {
        winston.warn('fileService.processProductOptionIdToOneSIdMappingFile -- could not get ids');
        throw new GeneralException();
    }

    const productOptions = await findProductOptionsByIds(
        productOptionIdToOneSId.map(m => m._id),
        transaction
    );
    if (!productOptions || !productOptions.length) {
        winston.warn('fileService.processProductOptionIdToOneSIdMappingFile -- could not get products');
        throw new GeneralException();
    }

    for (let i = 0; i < productOptions.length; i++) {
        const option = productOptions[i];
        const mapping = productOptionIdToOneSId.find(m => option._id.equals(m._id));
        if (!mapping) {
            break;
        }
        option.oneSId = mapping.oneSId;
        await updateProductOption(option._id, option, transaction);
    }
    flushCache();
    winston.debug('fileService.processProductOptionIdToOneSIdMappingFile -- success');
};

/**
 * Upload file to storage.
 * @param {File} file
 * @returns {Promise<Object>} {url}
 */
const uploadFileToStorage = async file => {
    winston.debug('fileService.uploadFileToStorage -- start');
    if (!file || !file.originalname) {
        winston.warn('fileService.uploadFileToStorage -- file not found');
        throw new GeneralException('File tapılmadı');
    }

    const url = await uploadFileToSpaces(file.originalname, file.buffer);
    if (!url) {
        winston.warn('fileService.uploadFileToStorage -- could not upload file');
        throw new GeneralException();
    }

    flushCache();
    winston.debug('fileService.uploadFileToStorage -- success');
    return { url };
};


const processManyProductOptionsFromFile = async (file, userId, transaction) => {
    winston.debug('fileService.processManyProductOptionsFromFile -- start');
    if (!file) {
        winston.warn('fileService.processManyProductOptionsFromFile -- null param');
        throw new GeneralException();
    }

    const options = parseProductOptionExcelFile(file)
    if (!options || !options.length) {
        winston.warn('fileService.processManyProductOptionsFromFile -- null param');
        throw new GeneralException()
    }

    options.forEach(async option => {
        let { name, color, price } = option.campaignEntity;
        if (!name || !color || !price) {
            return null;
        }

        const campaignView = { name, color, image: null, active: true, pricing: [{ price }] }

        let campaign = await findCampaignByName(name);
        if (campaign) {
            await modifyCampaign(campaign._id, campaignView);
            return option.campaignEntity._id = campaign._id;
        }

        campaign = await addNewCampaign(campaignView, userId);
        option.campaignEntity._id = campaign._id;
    })

    const [productOptions, loans] = await Promise.all([findProductOptionsByOneSIds(options.map(o => o.oneSId), transaction), getAllLoans()]);
    if (!productOptions || !productOptions.length || !loans || !loans.length) {
        winston.warn('fileService.processManyProductOptionsFromFile -- could not get products');
        throw new GeneralException();
    }

    const loansIds = {};
    loans.forEach(l => {
        loansIds[`${l.title}`] = l._id;
    });

    for (let i = 0; i < productOptions.length; i++) {
        const option = productOptions[i];
        const mapping = options.find(o => option.oneSId == o.oneSId);
        if (!mapping) {
            break;
        }

        const updatedProductOption = await assignRowsToProductOption(option, mapping, loansIds, userId, transaction);
        if (!updatedProductOption) {
            continue;
        }
        await updateProductOption(updatedProductOption._id, updatedProductOption, transaction);
    }

    flushCache();
    winston.debug('fileService.processManyProductOptionsFromFile -- success');
    return options;
}

const processCampaignsFile = async (file, userId, transaction) => {
    winston.debug('fileService.processCampaignsFile -- start');
    if (!file) {
        winston.warn('fileService.processCampaignsFile -- null param');
        throw new GeneralException();
    }

    const { campaigns, oneSIds } = parseCampaignsExcelFile(file);
    if (!campaigns && campaigns.length) {
        winston.warn('fileService.processCampaignsFile -- null param');
        throw new GeneralException();
    }

    const productOptions = await findProductOptionsByOneSIds(uniq(flatten(oneSIds)), transaction);
    if (!productOptions || !productOptions.length) {
        winston.warn('fileService.processCampaignsFile -- could not get products');
        throw new GeneralException();
    }

    for (let i = 0; i < campaigns.length; i++) {
        let existsCampaign = await findCampaignByName(campaigns[i].name);
        if (existsCampaign) {
            campaigns[i] = existsCampaign;
            continue;
        }
        campaigns[i] = await addNewCampaign({ name: campaigns[i].name, color: campaigns[i].color, image: null, active: true }, userId, transaction);
    }

    for (let i = 0; i < productOptions.length; i++) {
        const option = productOptions[i];

        oneSIds.forEach((oneSIdList, index) => {
            if (oneSIdList.includes(option.oneSId)) {
                option.campaigns = uniq([...option.campaigns, campaigns[index]._id]
                    .filter(c => c)
                    .map(c => c.toString())
                );
            }
        });
        updateProductOption(option._id, option);
    }

    flushCache();
    winston.debug('fileService.processCampaignsFile -- success');
    return productOptions;
}

module.exports = {
    generateProductsFile,
    generateProductParamsFile,
    generateXmlFeedsFile,
    parseOneSPricesFile,
    processNumbersFile,
    processProductOptionIdToOneSIdMappingFile,
    processManyProductOptionsFromFile,
    processCampaignsFile,
    uploadFileToStorage
};
