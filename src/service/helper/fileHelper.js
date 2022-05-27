const { range } = require('lodash');
const xlsx = require('node-xlsx');
const winston = require('winston');
const xmlbuilder = require('xmlbuilder');

const { NumberStatus } = require('../../enums');
const { GeneralException } = require('../../exceptions');
const { checkAndPopulateLoans } = require('./productHelper');

/**
 * Parses a phone number string in format '(55)989-09-87' into a NumberEntity object.
 * @private
 * @param {String} str
 * @param {Number} index
 * @returns {NumberEntity} number entity object
 */
const parseNumber = (str, index) => {
    if (!str || str.length !== 13 || str[0] !== '(' || str[3] !== ')') {
        winston.warn('fileHelper.parseNumber -- wrong number input');
        throw new GeneralException(`${index} sətrdə səhf nömrə: ${str}`);
    }
    let number = str.slice(4, str.length);
    number = `${number.slice(0, 3)}${number.slice(4, 6)}${number.slice(7, 9)}`;
    if (!parseFloat(number)) {
        winston.warn('fileHelper.parseNumber -- number contains invalid characters');
        throw new GeneralException(`${index} sətrdə səhf nömrə: ${str}`);
    }
    return {
        operator: `0${str.slice(1, 3)}`,
        number,
        digitOne: number[0],
        digitTwo: number[1],
        digitThree: number[2],
        digitFour: number[3],
        digitFive: number[4],
        digitSix: number[5],
        digitSeven: number[6],
    };
};

/**
 * Generate product option url.
 * @param {ProductOptionEntity} productOption
 * @returns {String}
 */
const generateLink = productOption => {
    if (!productOption) return null;
    return `https://w-t.az/${productOption.productId}/${productOption.slug}`;
};

/**
 * Generate XML product feed buffer.
 * @param {Array<ProductOptionEntity>} productOptions
 * @returns {Buffer}
 */
const generateXmlFeedsBuffer = productOptions => {
    winston.debug('fileHelper.generateXmlFeedsBuffer -- start');
    if (!productOptions || !productOptions.length) {
        winston.warn('fileHelper.generateXmlFeedsBuffer -- invalid param');
        return null;
    }

    const xmlObj = {
        feed: {
            '@xmlns:g': 'http://base.google.com/ns/1.0',
            '@xmlns': 'http://www.w3.org/2005/Atom',
        },
    };

    const xml = xmlbuilder
        .create(xmlObj)
        .ele('title', 'World Telecom')
        .up()
        .ele('link')
        .att('rel', 'self')
        .att('href', 'https://www.w-t.az')
        .up();

    productOptions
        .filter(po => po.published)
        .forEach(po => {
            xml.ele('entry')
                .ele('g:id', po.fullName)
                .up()
                .ele('g:title', po.fullName)
                .up()
                .ele('description', po.fullName)
                .att('xmlns', '')
                .up()
                .ele('g:link', generateLink(po))
                .up()
                .ele('g:image_link', po.images && po.images.length ? po.images[0] : '')
                .up()
                .ele('g:brand', po.product.manufacturer)
                .up()
                .ele('g:condition', 'new')
                .up()
                .ele('g:availability', 'in stock')
                .up()
                .ele('g:price', `${po.price} AZN`)
                .up()
                .ele('g:google_product_category', po.product.categories[0])
                .up()
                .ele('g:product_type', 'Basic')
                .up()
                .ele('g:sale_price', po.discount && po.discount.price ? `${po.discount.price} AZN` : `${po.price} AZN`)
                .up()
                .up();
        });

    const xmlString = xml.end();
    winston.debug('fileHelper.generateXmlFeedsBuffer -- success');
    return Buffer.from(xmlString);
};

/**
 * Creates excel file from given data and returns its location.
 * @param {Array<Array>>} data
 * @param {String} name
 * @returns {Buffer}
 */
const generateExcelFile = (data, name = 'w-t-file', equalCols) => {
    winston.warn('fileHelper.generateExcelFile -- start');
    if (!data) {
        winston.warn('fileHelper.generateExcelFile -- null param');
        return null;
    }

    let buffer;
    try {
        let options;
        if (equalCols) {
            options = { '!cols': [{ wch: 40 }] };
            range(50).forEach(() => {
                options['!cols'].push({ wch: 30 });
            });
        } else {
            options = {
                '!cols': [{ wch: 30 }, { wch: 20 }, { wch: 30 }, { wch: 60 }, { wch: 30 }, { wch: 10 }, { wch: 10 }],
            };
            range(10).forEach(() => {
                options['!cols'].push({ wch: 20 });
            });
        }

        buffer = xlsx.build([{ name, data }], options);
    } catch (error) {
        winston.error(`fileHelper.generateExcelFile -- ${JSON.stringify(error)}`);
        return null;
    }

    return buffer;
};

/**
 * Parse excel file
 * @param {File} file
 * @returns {Data}
 */
const parseExcelFile = file => {
    if (!file || !file.buffer) {
        winston.warn('fileHelper.parseExcelFile -- null param');
        throw new GeneralException();
    }

    const parsed = xlsx.parse(file.buffer);
    if (!parsed || !parsed.length) {
        winston.warn('fileHelper.parseOneSIdMappingFile -- no sheets found');
        throw new GeneralException('Səhf file formatı');
    }

    const { data } = parsed[0];
    if (!data || !data.length) {
        winston.warn('fileHelper.parseOneSIdMappingFile -- no rows found');
        throw new GeneralException('Boş fayl??');
    }

    return data;
};

/**
 * Parse excel file for GSM numbers.
 * @param {File} file
 * @param {String} userId
 * @returns {Array<NumberEntity>}
 */
const parseNumberExcelFile = (file, userId) => {
    winston.debug('fileHelper.parseNumberExcelFile -- start');
    if (!file || !userId) {
        winston.warn(`fileHelper.parseNumberExcelFile -- null param: ${file}, ${userId}`);
        throw new GeneralException();
    }

    const numbers = [];
    try {
        const data = parseExcelFile(file);
        data.forEach((row, index) => {
            if (!row || row.length < 2) {
                winston.warn('fileHelper.parseNumberExcelFile -- invalid row');
                throw new GeneralException(`${index} sətirdə səhf var`);
            }
            const numberObj = parseNumber(row[0], index);
            const price = parseFloat(row[1]);
            if (!price) {
                winston.warn('fileHelper.parseNumberExcelFile -- invalid row');
                throw new GeneralException(`${index} sətrdə səhf qiymət: ${row[1]}`);
            }
            const loanPrice = row.length === 3 ? parseFloat(row[2]) : null;
            numberObj.price = price;
            numberObj.loanPrice = loanPrice || null;
            numberObj.status = NumberStatus.AVAILABLE;
            numberObj.createdBy = userId;
            numbers.push(numberObj);
        });
    } catch (error) {
        winston.error(`fileHelper.parseNumberExcelFile -- ${JSON.stringify(error)}`);
        throw new GeneralException(error.message);
    }
    winston.debug('fileHelper.parseNumberExcelFile -- success');
    return numbers;
};

/**
 * Parses productId to oneS id mapping file.
 * @param {File} file
 * @param {*} userId
 * @returns {Array<ProductOptionIdToOneSId>}
 */
const parseOneSIdMappingFile = file => {
    winston.debug('fileHelper.parseOneSIdMappingFile -- start');
    if (!file) {
        winston.warn('fileHelper.parseOneSIdMappingFile -- null param');
        throw new GeneralException();
    }

    const ids = [];
    try {
        const data = parseExcelFile(file);
        data.forEach((row, index) => {
            if (!row || row.length < 2) {
                winston.warn('fileHelper.parseOneSIdMappingFile -- invalid row');
                throw new GeneralException(`${index} sətirdə səhf var`);
            }

            const productOptionId = row[0];
            const oneSId = row[1];
            if (index !== 0 && productOptionId && oneSId) {
                ids.push({ _id: productOptionId, oneSId });
            }
        });
    } catch (error) {
        winston.error(`fileHelper.parseOneSIdMappingFile -- ${JSON.stringify(error)}`);
        throw new GeneralException(error.message);
    }
    winston.debug('fileHelper.parseOneSIdMappingFile -- start');
    return ids;
};


const parseProductOptionExcelFile = file => {
    winston.debug('fileHelper.parseProductOptionExcelFile -- start');
    if (!file) {
        winston.warn('fileHelper.parseProductOptionExcelFile -- null param');
        throw new GeneralException();
    }

    const rand = () => (10 ** 10 * Math.random() + 10 ** 10 * Math.random()).toString();
    const optionData = [];

    try {
        const data = parseExcelFile(file)
            .filter(p => p.length)
            .map(p => p.map(value => typeof (value) == 'number' ? Math.round(value * 100) / 100 : value));

        data.forEach((row, index) => {
            if (!row || index < 2) return;

            const option = {};

            option.oneSId = row[0];
            option.price = row[3];
            option.discount = { price: row[6] ? row[6] : 0 };
            option.discount.description = row[6] ? 'Nagd alisda endirim' : '';
            option.defaultMonth = row[7];
            option.loan6_1Months = { title: 'Daxili kredit', active: true, isMain: row[7]===6, period: 6, firstPayment: row[8], price: row[8] + row[9] * 6, loanOptionId: rand() };
            option.loan12Months = { title: 'Daxili kredit', active: true, isMain: row[7] === 12, period: 12, firstPayment: row[12], price: row[12] + row[13] * 12, loanOptionId: rand() };
            option.loan14Months = { title: 'Daxili kredit', active: true, isMain: row[7] === 14, period: 14, firstPayment: row[10], price: row[10] + row[11] * 14, loanOptionId: rand() };
            option.loan18Months = { title: 'Daxili kredit', active: true, isMain: row[7]===18, period: 18, firstPayment: row[14], price: row[14] + row[15] * 18, loanOptionId: rand() };
            option.loanBirCart = { title: 'BirKart', active: true, period: row[17], firstPayment: 0, price: row[16] * row[17], loanOptionId: rand() };
            option.loanTamCart = { title: 'TAM kart', active: true, period: row[19], firstPayment: 0, price: row[18] * row[19], loanOptionId: rand() };
            option.loanAlbaliCart = { title: 'Albali Plus', active: true, period: row[21], firstPayment: 0, price: row[20] * row[21], loanOptionId: rand() };
            option.campaignEntity = row[4] ? { name: row[4].split('/')[0].trim(), color: row[4].split('/')[1].trim(), price: row[5] } : {};

            optionData.push(option);
        });
    }
    catch (error) {
        winston.error(`fileHelper.parseProductOptionExcelFile -- ${JSON.stringify(error)}`);
        throw new GeneralException(error.message);
    }

    winston.debug('fileHelper.parseProductOptionExcelFile -- success');
    return optionData;
}

const assignRowsToProductOption = async (option, mapping, loansIds, userId, transaction) => {
    winston.debug('fileHelper.assignRowsToProductOption -- start');
    if (!option || !mapping) {
        winston.debug('fileHelper.assignRowsToProductOption -- null param');
        throw new GeneralException();
    }

    option.price = mapping.price;
    option.discount = mapping.discount;
    const loanOptions = [
        mapping.loan6_1Months,
        mapping.loan12Months,
        mapping.loan14Months,
        mapping.loan18Months,
        mapping.loanBirCart,
        mapping.loanAlbaliCart,
        mapping.loanTamCart
    ].filter(l => l.price).map(l => new Object({ ...l, _id: loansIds[l.title] }));
    option.loanOptions = await checkAndPopulateLoans(loanOptions, userId, transaction);

    let campaignId = mapping.campaignEntity._id;
    if (!option.campaigns.includes(campaignId) && campaignId) {
        option.campaigns.push(campaignId);
    };

    winston.debug('fileHelper.assignRowsToProductOption -- success');
    return option;
}

const parseCampaignsExcelFile = file => {
    winston.debug('fileHelper.parseCampaignsExcelFile -- start');
    if (!file) {
        winston.warn('fileHelper.parseCampaignsExcelFile -- null param');
        throw new GeneralException();
    }

    const campaigns = [];
    const oneSIds = [];

    try {
        const data = parseExcelFile(file).filter(row => row.length);
        data.forEach((row, index) => {
            if (!row || index < 1) return null;

            let entity = {
                name: row[0],
                color: row[1]
            };
            let oneSId = row[2].split(',').map(oneSId => oneSId.trim());

            campaigns.push(entity);
            oneSIds.push(oneSId);
        })
    }
    catch (error) {
        winston.error(`fileHelper.parseCampaignsExcelFile -- ${JSON.stringify(error)}`);
        throw new GeneralException(error.message);
    }
    winston.debug('fileHelper.parseCampaignsExcelFile -- success');
    return { campaigns, oneSIds };
}

module.exports = {
    generateXmlFeedsBuffer,
    generateExcelFile,
    parseExcelFile,
    parseCampaignsExcelFile,
    parseNumberExcelFile,
    parseOneSIdMappingFile,
    parseProductOptionExcelFile,
    assignRowsToProductOption
};
