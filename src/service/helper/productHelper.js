const winston = require('winston');
const { includes, uniq } = require('lodash');

const { ADMIN_DEFAULT_QUERY_LIMIT, MEMORY_PARAM } = require('../../constants');
const { ConflictException, NotFoundException } = require('../../exceptions');
const { getSubcategories } = require('./categoryHelper');
const { findLoansInIds } = require('../../repository/loanRepository');
const { findProductByOptionId } = require('../../repository/productRepository');
const { sortMemories } = require('../../utils/commonUtils');
const ProductOption = require('../../repository/models/productOptionModel');


/**
 * Checks the loans and populates their fields from db.
 * @param {Array<ProductOption.LoanOption>} loans
 * @param {String} userId
 * @param {Transaction} transaction
 * @returns {Promise<Array<LoanOptions>>} populated loan options
 */
const checkAndPopulateLoans = async (loans, userId, transaction) => {
    winston.debug('productHelper.checkAndPopulateLoans -- start');
    if (!loans || !loans.length) {
        winston.warn('productHelper.checkAndPopulateLoans -- no loans');
        return [];
    }

    const loanIds = loans.map(l => l._id);
    const uniqueLoanIds = uniq(loanIds);
    const loanEntities = await findLoansInIds(uniqueLoanIds, transaction);
    if (loanEntities.length !== uniqueLoanIds.length) {
        winston.warn('productHelper.checkAndPopulateLoans -- loan not found');
        throw new NotFoundException('Loan not found');
    }

    const productOptionLoanOptions = [];
    const currenDate = Date.now();
    loans.forEach(l => {
        const loanEntity = loanEntities.find(le => le._id.equals(l._id));
        const loanOptionId = l.loanOptionId ? l.loanOptionId : Date.now().toString();
        productOptionLoanOptions.push({
            ...l,
            color: loanEntity.color,
            image: loanEntity.image,
            loanOptionId,
            title: loanEntity.title,
            assignedBy: userId,
            assignedAt: currenDate,
        });
    });

    winston.debug('productHelper.checkAndPopulateLoans -- success');
    return productOptionLoanOptions;
};

/**
 * Checks if the give identificator already exists within a product.
 * @param {String} identificator
 * @param {Array<ProductOption>} options
 */
const checkIdentificator = (identificator, options) => {
    winston.debug('productHelper.checkIdentificator -- start');
    const identificatorExists = options.find(o => o.identificator === identificator);
    if (identificatorExists) {
        winston.warn('productController.addNewProduct -- identificator exists');
        throw new ConflictException('Identificator exists');
    }
    winston.debug('productHelper.checkIdentificator -- success');
};

/**
 * Checks if product has given installment period available.
 * @param {Array<ObjectId>} productOptions
 * @param {Number} installmentPeriod
 * @returns {Promise<Boolean>}
 */
const checkInstallmentPeriod = async (productOptions, installmentPeriod) => {
    winston.debug('productHelper.checkInstallmentPeriod -- start');
    if (!productOptions || !productOptions.length) return true;
    if (!installmentPeriod) return false;

    let result;
    for (let i = 0; i < productOptions.length; i++) {
        const product = await findProductByOptionId(productOptions[i]);
        if (!product || !product.birKartMonths || !product.birKartMonths.length) {
            winston.debug('productHelper.checkInstallmentPeriod -- empty bir kart months');
            return false;
        }

        result = includes(product.birKartMonths, installmentPeriod);
    }
    winston.debug('productHelper.checkInstallmentPeriod -- success');
    return result;
};

/**
 * Detects all color options of a product.
 * @param {Array<ProductOption>} productOptions
 * @param {Array<String>} memories
 * @returns {Array<String>} colors
 */
const detectColors = (productOptions, memories) => {
    winston.debug('productHelper.detectColors -- start');
    if (!productOptions || !productOptions.length) {
        return [];
    }

    const colors = [];
    if (!memories || !memories.length) {
        productOptions.forEach(o => {
            if (o.color) colors.push(o.color);
        });
        return colors;
    }

    productOptions.forEach(o => {
        if (o.memory === memories[0] && o && o.color) {
            colors.push(o.color);
        }
    });
    winston.debug('productHelper.detectColors -- success');
    return colors;
};

/**
 * Detects all memory options of a product.
 * @param {Array<ProductOption>} productOptions
 * @returns {Array<String>} memories
 */
const detectMemories = productOptions => {
    winston.debug('productHelper.detectMemories -- start');
    if (!productOptions || !productOptions.length) return [];
    const memories = [];
    productOptions.forEach(o => {
        const memParam = o.parameters && o.parameters.length ? o.parameters.find(p => p.name === MEMORY_PARAM) : null;
        if (o.published && memParam && memParam.value && memories.indexOf(memParam.value) === -1) {
            memories.push(memParam.value);
        }
    });

    winston.debug('productHelper.detectMemories -- success');
    return sortMemories(memories);
};

/**
 * Returns a full name for product option (manufacturer, model, identificator).
 * @param {Product} productEntity
 * @param {ProductOption} productOption
 * @returns {String} product's full name
 */
const generateProductOptionFullName = (productEntity, productOptionEntity) => {
    if (!productEntity || !productOptionEntity) {
        return null;
    }
    const { manufacturer, model } = productEntity;
    const identificator = productOptionEntity.identificator ? ` ${productOptionEntity.identificator}` : '';
    return `${manufacturer} ${model}${identificator}`;
};

/**
 * Returns memory parameter's value if exists.
 * @param {Array<String>} parameters
 * @returns {String} memory
 */
const getMemoryFromParameters = parameters => {
    if (!parameters || !parameters.length) return null;
    const memoryParam = parameters.find(p => p.name === MEMORY_PARAM);
    return memoryParam ? memoryParam.value : null;
};

/**
 * Gets query params from request and sets adds them to result object.
 * @param {req.query} query
 * @returns {Promise<Object>} pagination and filter info object
 */
const getSortAndFilterParamsFromRequestQuery = async query => {
    winston.debug('productHelper.getSortAndFilterParamsFromRequestQuery -- start');
    if (!query) return null;

    const result = {};
    if (query.category && query.category !== 'all') {
        const subcategories = await getSubcategories(query.category);
        subcategories.push(query.category);
        result.categories = subcategories;
    }
    result.campaigns = query.campaigns ? query.campaigns.split(' ') : null;
    result.isPopular = query.isPopular === 'YES';
    result.isDiscounted = query.isDiscounted === 'YES';
    result.newProduct = query.newProduct === 'YES';
    result.limit = query.limit ? parseInt(query.limit, 10) : ADMIN_DEFAULT_QUERY_LIMIT;
    result.manufacturers = query.manufacturer ? query.manufacturer.split('|') : null;
    result.maxPrice = parseFloat(query.maxPrice);
    result.memories = query.memory ? query.memory.split('--') : null;
    result.minPrice = parseFloat(query.minPrice) || 0;

    // Parameters filter
    result.screenDimensions = query.screenDimensions ? query.screenDimensions.split('|') : null; 
    
    result.displayCapability = query.displayCapability ? query.displayCapability.split('|') : null; 
    result.isSmartTV = query.isSmartTV ? query.isSmartTV.split('|') : null;
    result.displayType = query.displayType ? query.displayType.split('|') : null; 
    
    result.OS = query.OS ? query.OS.split('|') : null;
    result.ram = query.ram ? query.ram.split('|') : null;
    result.processor = query.processor ? query.processor.split('|') : null;

    result.model = query.model;
    result.page = query.page ? parseInt(query.page, 10) : 1;
    result.sort = query.sort;
    result.search = query.search;
    winston.debug('productHelper.getSortAndFilterParamsFromRequestQuery -- success');
    return result;
};

const mapOneSPricesToProductOption = (productOption, oneSPriceMapping) => {
    winston.debug('productHelper.mapOneSPricesToProductOption -- start');
    if (!productOption || !oneSPriceMapping) {
        winston.warn('productHelper.mapOneSPricesToProductOption -- null param');
        return null;
    }

    const { price, discountedPrice, loan12Months, loan18Months } = oneSPriceMapping;

    productOption.price = price;

    if (productOption.discount && productOption.discount.price && discountedPrice) {
        productOption.discount.price = discountedPrice;
        productOption.discount.description = `Nağd alışda ${price - discountedPrice} ₼ endirim`;
    }

    if (productOption.loanOptions && productOption.loanOptions.length) {
        const internalLoan6Months = productOption.loanOptions.find(lo => lo.period === 6);
        if (internalLoan6Months) {
            internalLoan6Months.price = price;
            internalLoan6Months.firstPayment = price / 2;
        }

        const internalLoan12Months = productOption.loanOptions.find(lo => lo.period === 12);
        if (internalLoan12Months && loan12Months) {
            internalLoan12Months.price = loan12Months;
            internalLoan12Months.firstPayment = 0;
        }

        const internalLoan18Months = productOption.loanOptions.find(lo => lo.period === 18);
        if (internalLoan18Months && loan18Months) {
            internalLoan18Months.price = loan18Months;
            internalLoan18Months.firstPayment = 0;
        }

        const externalLoans = productOption.loanOptions.filter(lo => lo.title !== 'Daxili kredit');
        if (externalLoans && externalLoans.length) {
            externalLoans.forEach(el => {
                el.price = discountedPrice || price;
            });
        }
    }

    winston.debug('productHelper.mapOneSPricesToProductOption -- success');
    return productOption;
};

const editTags = async (product, allSeoData) => {
    winston.debug("productHelper.editTags -- start");
    const editedTags = [];
    const onlyTags = [];

    product.tags.forEach((tag) => {
        allSeoData.forEach((seoData) => {
            if (seoData.tag === tag) {
                editedTags.push({ tag, isSeo: true });
                onlyTags.push(tag)
                return 0;
            }

            if (allSeoData.indexOf(seoData) == allSeoData.length - 1 && !(onlyTags.includes(tag))) {
                editedTags.push({ tag, isSeo: false });
            }
        });
    });

    product.tags = editedTags;
    const editedProduct = new Object(product._doc);
    editedProduct.tags = editedTags;

    winston.debug("productHelper.editTags -- success");
    return product;

}

module.exports = {
    checkAndPopulateLoans,
    checkIdentificator,
    checkInstallmentPeriod,
    detectColors,
    detectMemories,
    generateProductOptionFullName,
    getMemoryFromParameters,
    getSortAndFilterParamsFromRequestQuery,
    mapOneSPricesToProductOption,
    editTags
};
