const mongoose = require('mongoose');
const winston = require('winston');

const { sanitizeStringForRegEx } = require('../../utils/commonUtils');

const generateFilterAndQueryForProducts = ({
    campaigns,
    categories,
    isPopular,
    isDiscounted,
    newProduct,
    manufacturers,
    maxPrice,
    memories,
    minPrice,
    screenDimensions,
    displayCapability,
    isSmartTV,
    displayType,
    OS,
    ram,
    processor,
    model,
    search,
    published,
} = {}) => {
    winston.debug('productRepositoryHelper.generateFilterAndQueryForProducts -- start');
    let filter = { input: '$options', cond: { $and: [] } };
    let query = { $and: [] };

    if (campaigns && campaigns.length) {
        const campaignObjectIds = campaigns.map(c => mongoose.Types.ObjectId(c));
        // filter.cond.$and.push({ $in: ['$$this.campaigns', [campaignObjectIds]] });
        query.$and.push({ 'options.campaigns': { $in: campaignObjectIds } });
    }

    if (manufacturers) {
        query.$and.push({ manufacturer: { $in: manufacturers } });
    }
    if (memories) {
        filter.cond.$and.push({ $in: ['$$this.memory', memories] });
        query.$and.push({ 'options.memory': { $in: memories } });
    }
    if (model) {
        query.$and.push({
            model: { $regex: new RegExp(`^.*${sanitizeStringForRegEx(model)}.*$`, 'i') },
        });
    }
    if (isPopular) {
        query.$and.push({ isPopular });
    }
    if (newProduct) {
        query.$and.push({ newProduct });
    }
    if (minPrice) {
        filter.cond.$and.push({ $gte: ['$$this.price', minPrice] });
        query.$and.push({ 'options.price': { $gte: minPrice } });
    }
    if (isDiscounted) {
        filter.cond.$and.push({ $and: [{ $ne: ['$$this.discount.price', 0], $ne: ['$$this.discount.price', null] }] });
        query.$and.push({ 'options.discount.price': { $nin: [0, null] } });
    }
    if (maxPrice) {
        filter.cond.$and.push({ $lte: ['$$this.price', maxPrice] });
        query.$and.push({ 'options.price': { $lte: maxPrice } });
    }
    if (categories && categories.length) {
        query.$and.push({ categories: { $elemMatch: { $in: categories } } });

        if (screenDimensions && screenDimensions.length) {
            query.$and.push({
                $and: [{ 'options.parameters.value': { $in: screenDimensions } }, { 'options.parameters.name': { $in: ['Ekranın ölçüsü'] } }]
            })
        }
        if (displayCapability && displayCapability.length) {
            query.$and.push({
                $and: [{ 'options.parameters.value': { $in: displayCapability } }, { 'options.parameters.name': { $in: ['Ekranın imkanları'] } }]
            })
        }
        if (isSmartTV && isSmartTV.length) {
            query.$and.push({
                $and: [{ 'options.parameters.value': { $in: isSmartTV } }, { 'options.parameters.name': { $in: ['Smart TV'] } }]
            })
        }
        if (displayType && displayType.length) {
            query.$and.push({
                $and: [{ 'options.parameters.value': { $in: displayType } }, { 'options.parameters.name': { $in: ['Ekran növü'] } }]
            })
        }
        if (OS && OS.length) {
            query.$and.push({
                $and: [{ 'options.parameters.value': { $in: OS } }, { 'options.parameters.name': { $in: ['Əməliyyat sistemi'] } }]
            })
        }
        if (ram && ram.length) {
            query.$and.push({
                $and: [{ 'options.parameters.value': { $in: ram } }, { 'options.parameters.name': { $in: ['Operativ yaddaş (RAM)'] } }]
            })
        }
        if (processor && processor.length) {
            query.$and.push({
                $and: [{ 'options.parameters.value': { $in: processor } }, { 'options.parameters.name': { $in: ['Prosessor'] } }]
            })
        }
        // screenDimensions, displayCapability, isSmartTV, displayType, 
        // screenDimensions, operatingSystem  , ram      , memories   , processor
    }


    // if (parameterNames && parameterValues) {
    //     for (let i = 0; i < parameterNames.length; i++) {
    //         query.$and.push({
    //             $and: [{ 'options.parameters.value': { $in: parameterValues[i] } }, { 'options.parameters.name': { $in: [parameterNames[i]] } }]
    //         })
    //     }
    // }

    if (search) {
        const orArray = [
            { tags: { $regex: new RegExp(`^.*${sanitizeStringForRegEx(search)}.*$`, 'i') } },
            { 'options.fullName': { $regex: new RegExp(`^.*${sanitizeStringForRegEx(search)}.*$`, 'i') } },
            { model: search },
            { model: { $regex: new RegExp(`^.*${sanitizeStringForRegEx(search)}.*$`, 'i') } },
            { manufacturer: { $regex: new RegExp(`^.*${sanitizeStringForRegEx(search)}.*$`, 'i') } },
            { 'options.identificator': { $regex: new RegExp(`^.*${sanitizeStringForRegEx(search)}.*$`, 'i') } },
            { categories: { $regex: new RegExp(`^.*${sanitizeStringForRegEx(search)}.*$`, 'i') } },
        ];
        const separateWords = search.split(' ');
        if (separateWords && separateWords.length) {
            if (separateWords.length === 2) {
                orArray.push({
                    $and: [
                        {
                            manufacturer: {
                                $regex: new RegExp(`^.*${sanitizeStringForRegEx(separateWords[0])}.*$`, 'i'),
                            },
                        },
                        { model: { $regex: new RegExp(`^.*${sanitizeStringForRegEx(separateWords[1])}.*$`, 'i') } },
                    ],
                });
            } else if (separateWords.length >= 3) {
                let identificator = '';
                // eslint-disable-next-line no-plusplus
                for (let i = 0; i < separateWords.identificator; i++) {
                    identificator += `${separateWords[i]} `;
                }
                orArray.push({
                    $and: [
                        {
                            manufacturer: {
                                $regex: new RegExp(`^.*${sanitizeStringForRegEx(separateWords[0])}.*$`, 'i'),
                            },
                        },
                        { model: { $regex: new RegExp(`^.*${sanitizeStringForRegEx(separateWords[1])}.*$`, 'i') } },
                        {
                            identificator: {
                                $regex: new RegExp(`^.*${sanitizeStringForRegEx(identificator)}.*$`, 'i'),
                            },
                        },
                    ],
                });
            } else {
                separateWords.forEach(w => {
                    orArray.push({ model: { $regex: new RegExp(`^.*${sanitizeStringForRegEx(w)}.*$`, 'i') } });
                });
            }
        }
        query.$and.push({ $or: orArray });
    }
    if (published) {
        filter.cond.$and.push({ $eq: ['$$this.published', true] });
        query.$and.push({ 'options.published': true });
    }

    filter = filter.cond.$and ? filter : {};
    query = query.$and.length ? query : {};

    winston.debug('productRepositoryHelper.generateFilterAndQueryForProducts -- success');
    return { filter, query };
};

module.exports = {
    generateFilterAndQueryForProducts,
};
