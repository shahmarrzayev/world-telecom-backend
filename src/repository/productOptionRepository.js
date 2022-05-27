const { Types } = require('mongoose');
const winston = require('winston');

const { runQuery } = require('./helper/repositoryHelper');
const ImportProductsStatus = require('./models/importProductsStatusModel');
const ProductOption = require('./models/productOptionModel');


const deleteCampaignsFromProductOptions = async (ids, transaction) => {
    winston.debug('productOptionRepository.deleteCampaignsFromProductOptions -- start');
    if (!ids || !ids.length) {
        winston.warn('productOptionRepository.deleteCampaignsFromProductOptions -- null or empty param');
        return null;
    }
    const queryResult = await runQuery(() =>
        ProductOption.updateMany({}, { $pullAll: { campaigns: ids } }, { multi: true, session: transaction })
    );
    winston.debug('productOptionRepository.deleteCampaignsFromProductOptions -- success');
    return queryResult;
};

const deleteLoansFromProductOptions = async (ids, transaction) => {
    winston.debug('productOptionRepository.deleteLoansFromProductOptions -- start');
    if (!ids || !ids.length) {
        winston.warn('productOptionRepository.deleteLoansFromProductOptions -- null or empty param');
        return null;
    }
    const queryResult = await runQuery(() =>
        ProductOption.updateMany({}, { $pull: { loanOptions: { _id: { $in: ids } } } }, { session: transaction })
    );
    winston.debug('productOptionRepository.deleteLoansFromProductOptions -- success');
    return queryResult;
};

const deleteParamatersFromProductOptions = async (paramNames, transaction) => {
    winston.debug('productOptionRepository.deleteParamatersFromProductOptions -- start');
    if (!paramNames || !paramNames.length) {
        winston.warn('productOptionRepository.deleteParamatersFromProductOptions -- null or empty param');
        return null;
    }
    const queryResult = await runQuery(() =>
        ProductOption.updateMany({}, { $pull: { parameters: { name: { $in: paramNames } } } }, { session: transaction })
    );
    winston.debug('productOptionRepository.deleteParamatersFromProductOptions -- success');
    return queryResult;
};

const deleteProductOptionInProductIds = async (productIds, transaction) => {
    winston.debug('productOptionRepository.deleteProductOptionInProductIds -- start');
    if (!productIds || !productIds.length) {
        winston.warn('productOptionRepository.deleteLoansFromProductOptions -- null or empty param');
        return null;
    }
    const queryResult = await runQuery(() =>
        ProductOption.deleteMany({ productId: { $in: productIds } }, { session: transaction })
    );
    winston.debug('productOptionRepository.deleteProductOptionInProductIds -- success');
    return queryResult;
};

const findAllProductOptions = async transaction => {
    winston.debug('productOptionRepository.findAllProductOptions -- start');
    const allProductOptions = await runQuery(() => ProductOption.find().session(transaction));
    winston.debug('productOptionRepository.findAllProductOptions -- success');
    return allProductOptions;
};

const findDistinctMemories = async transaction => {
    winston.debug('productOptionRepository.findDistinctMemories -- start');
    const memories = await runQuery(() =>
        ProductOption.find({})
            .distinct('memory')
            .session(transaction)
    );
    winston.debug('productOptionRepository.findDistinctMemories -- success');
    return memories;
};

const findProductOptionByFullName = async (fullName, transaction) => {
    winston.debug('productOptionRepository.findProductOptionByFullName -- start');
    if (!fullName) {
        winston.debug('productOptionRepository.findProductOptionByFullName -- null param');
        return null;
    }
    const productOption = await runQuery(() => ProductOption.findOne({ fullName }).session(transaction));
    winston.debug('productOptionRepository.findProductOptionByFullName -- success');
    return productOption;
};

const findProductOptionById = async (id, transaction) => {
    winston.debug('productOptionRepository.findProductOptionById -- start');
    if (!id) {
        winston.warn('productOptionRepository.findProductOptionById -- null param');
        return null;
    }
    const productOption = await runQuery(() => ProductOption.findById(id).session(transaction));
    winston.debug('productOptionRepository.findProductOptionById -- success');
    return productOption;
};

const findProductOptionBySlug = async (slug, transaction) => {
    winston.debug('productOptionRepository.findProductOptionBySlug -- start');
    if (!slug) {
        winston.debug('productOptionRepository.findProductOptionBySlug -- null param');
        return null;
    }
    const productOption = await runQuery(() => ProductOption.findOne({ slug }).session(transaction));
    winston.debug('productOptionRepository.findProductOptionBySlug -- success');
    return productOption;
};

const findProductOptionsByOneSId = async (oneSId, transaction) => {
    winston.debug('productOptionRepository.findProductOptionsByOneSId -- start');
    if (!oneSId) {
        winston.warn('productOptionRepository.findProductOptionsByOneSId -- null param');
        return null;
    }
    const productOption = await runQuery(() => ProductOption.find({ oneSId }).session(transaction));
    winston.debug('productOptionRepository.findProductOptionsByOneSId -- success');
    return productOption;
};

const findProductOptionsByIds = async (ids, transaction) => {
    winston.debug('productOptionRepository.findProductOptionsByIds -- start');
    if (!ids || !ids.length) {
        winston.warn('productOptionRepository.findProductOptionsByIds -- null or empty param');
        return null;
    }
    const productOptions = await runQuery(() => ProductOption.find({ _id: { $in: ids } }).session(transaction));
    winston.debug('productOptionRepository.findProductOptionsByIds -- success');
    return productOptions;
};

const findProductOptionsBySlugs = async (slugs, transaction) => {
    winston.debug('productOptionRepository.findProductOptionsBySlugs -- start');
    if (!slugs || !slugs.length) {
        winston.warn('productOptionRepository.findProductOptionsBySlugs -- null or empty param');
        return null;
    }
    const productOptions = await runQuery(() => ProductOption.find({ slug: { $in: slugs } }).session(transaction));
    winston.debug('productOptionRepository.findProductOptionsBySlugs -- success');
    return productOptions;
};

const findProdutOptionByProductAndOptionId = async (id, optionId, transaction) => {
    winston.debug('productOptionRepository.findProdutOptionById -- start');
    if (!id || !optionId) {
        winston.warn(`productOptionRepository.findProdutOptionById -- null param: ${id}, ${optionId}`);
        return null;
    }
    const productOption = await runQuery(() =>
        ProductOption.findOne({ _id: optionId, productId: id }).session(transaction)
    );
    winston.debug('productOptionRepository.findProdutOptionByProductAndOptionId -- success');
    return productOption;
};

const findProductOptionsByOneSIds = async (ids, transaction) => {
    winston.debug('productOptionRepository.findProductOptionsByOneSIds -- start');
    if (!ids || !ids.length) {
        winston.warn('productOptionRepository.findProductOptionsByOneSIds -- null param');
        return null;
    }
    const productOptions = await runQuery(() => ProductOption.find({ oneSId: { $in: ids } }).session(transaction));
    winston.debug('productOptionRepository.findProductOptionsByOneSIds -- success');
    return productOptions;
}

const findProductOptionsByProductId = async (id, transaction) => {
    winston.debug('productOptionRepository.findProductOptionsByProductId -- start');
    if (!id) {
        winston.warn(`productOptionRepository.findProductOptionsByProductId -- null param: ${id}`);
        return null;
    }
    const productOptions = await runQuery(() => ProductOption.find({ productId: id }).session(transaction));
    winston.debug('productOptionRepository.findProductOptionsByProductId -- success');
    return productOptions;
};

const saveProductOption = async (productOption, transaction) => {
    winston.debug('productOptionRepository.saveProductOption -- start');
    if (!productOption) {
        winston.warn('productOptionRepository.saveProductOption -- null param');
        return null;
    }
    const dbProductOption = new ProductOption(productOption);
    const savedProductOption = await runQuery(() => dbProductOption.save({ session: transaction }));
    winston.debug('productOptionRepository.saveProductOption -- success');
    return savedProductOption;
};

const updateLoanInProductOptions = async (loan, transaction) => {
    winston.debug('productOptionRepository.updateLoanInProductOptions -- start');
    if (!loan) {
        winston.warn('productOptionRepository.updateLoanInProductOptions -- null param');
        return null;
    }
    const queryResult = await runQuery(() =>
        ProductOption.updateMany(
            { 'loanOptions._id': loan._id },
            {
                $set: {
                    'loanOptions.$.active': loan.active,
                    'loanOptions.$.title': loan.title,
                    'loanOptions.$.image': loan.image,
                    'loanOptions.$.color': loan.color,
                    'loanOptions.$.description': loan.description,
                },
            },
            { multi: true, session: transaction }
        )
    );
    winston.debug('productOptionRepository.updateLoanInProductOptions -- success');
    return queryResult;
};

const updateParameterInProductOption = async (parameter, newName, transaction) => {
    winston.debug('productOptionRepository.updateParameterInProductOption -- start');
    if (!parameter || !newName) {
        winston.warn(`productOptionRepository.updateParameterInProductOption -- null param: ${parameter}, ${newName}`);
        return null;
    }
    const queryResult = await runQuery(() =>
        ProductOption.updateMany(
            { 'parameters.name': parameter },
            { $set: { 'parameters.$.name': newName } },
            { session: transaction }
        )
    );
    winston.debug('productOptionRepository.updateParameterInProductOption -- success');
    return queryResult;
};

const updateProductOption = async (id, product, transaction) => {
    winston.debug('productOptionRepository.updateProductOption -- start');
    if (!id || !product) {
        winston.warn(`productOptionRepository.updateProductOption -- null param: ${id}`);
        return null;
    }
    const updatedOption = await runQuery(() =>
        ProductOption.findOneAndUpdate({ _id: id }, product, {
            session: transaction,
            useFindAndModify: false,
        })
    );
    winston.debug('productOptionRepository.updateProductOption -- success');
    return updatedOption;
};

const updateProductOptionIsDefault = async (productId, isDefault, transaction) => {
    winston.debug('productOptionRepository.updateProductOptionIsDefault -- start');
    if (!productId) {
        winston.warn('productOptionRepository.updateProductOptionIsDefault -- null param');
        return null;
    }
    const updatedProductOption = await runQuery(() =>
        ProductOption.findOneAndUpdate({ productId }, { isDefault }, { session: transaction, useFindAndModify: false })
    );
    winston.debug('productOptionRepository.updateProductOptionIsDefault -- success');
    return updatedProductOption;
};

const updateProductOptionsProductInfo = async (product, transaction) => {
    winston.debug('productOptionRepository.updateProductOptionsProductInfo -- start');
    if (!product || !product._id) {
        winston.warn('productOptionRepository.updateProductOptionsProductInfo -- null param');
        return null;
    }
    try {
        const options = await runQuery(() =>
            ProductOption.find({ productId: Types.ObjectId(product._id) }).session(transaction)
        );
        if (options) {
            for (let i = 0; i < options.length; i++) {
                const option = options[i];
                option.product.categories = product.categories;
                option.product.manufacturer = product.manufacturer;
                option.product.model = product.model;
                option.product.onlinePaymentEnabled = product.onlinePaymentEnabled;
                option.product.albaliKartPaymentEnabled = product.albaliKartPaymentEnabled;
                option.product.birKartPaymentEnabled = product.birKartPaymentEnabled;
                option.product.birKartMonths = product.birKartMonths;
                option.product.tamKartPaymentEnabled = product.tamKartPaymentEnabled;
                option.product.loanDescriptions = product.loanDescriptions || [];
                const identificator = option.identificator ? ` ${option.identificator}` : '';
                option.fullName = `${product.manufacturer} ${product.model}${identificator}`;
                await runQuery(() => ProductOption.updateOne({ _id: option._id }, option, { session: transaction }));
            }
        }
    } catch (error) {
        winston.error(`productOptionRepository.updateProductOptionsProductInfo -- ${JSON.stringify(error)}`);
        return null;
    }
    winston.debug('productOptionRepository.updateProductOptionsProductInfo -- success');
    return true;
};

const updateProductOptionByOneSId = async (sid, product, transaction) => {
    winston.debug('productOptionRepository.updateProductOptionByOneSId -- start');
    if (!sid || !product) {
        winston.warn(`productOptionRepository.updateProductOptionByOneSId -- null param: ${sid}`);
        return null;
    }
    const updatedOption = await runQuery(() =>
        ProductOption.findOneAndUpdate({ oneSId: sid }, product, {
            session: transaction,
            useFindAndModify: false,
        })
    );

    winston.debug('productOptionRepository.updateProductOptionByOneSId -- success');
    return updatedOption;
};

const createImportProductsStatus = (path, transaction) => {
    const dbStatus = new ImportProductsStatus({
        path,
        status: 'Yüklənir'
    })
    dbStatus.save({ transaction })
    return dbStatus;
}

const updateImportProductsStatus = (path, transaction) => {
    const updateStatus = ImportProductsStatus.findOneAndUpdate({ path }, {
        path,
        status: 'Yükləndi'
    },
        {
            session: transaction,
            useFindAndModify: false
        })
    return updateStatus;
}

const findParametersFromProductOptions = async (name, transaction) => {
    if (!name) {
        winston.warn(`productOptionRepository.findParametersFromProductOptions-- null param: ${sid}`);
        return null;
    }
    const productOptions = await ProductOption.find({
        "product.categories": name
    }).session(transaction)
    const parameters = productOptions.map(o => o.parameters);
    return parameters;
}

module.exports = {
    deleteCampaignsFromProductOptions,
    deleteLoansFromProductOptions,
    deleteParamatersFromProductOptions,
    deleteProductOptionInProductIds,
    findAllProductOptions,
    findDistinctMemories,
    findProductOptionByFullName,
    findProductOptionById,
    findProductOptionBySlug,
    findProdutOptionByProductAndOptionId,
    findProductOptionsByOneSId,
    findProductOptionsByIds,
    findProductOptionsBySlugs,
    findProductOptionsByProductId,
    findProductOptionsByOneSIds,
    findParametersFromProductOptions,
    saveProductOption,
    createImportProductsStatus,
    updateLoanInProductOptions,
    updateParameterInProductOption,
    updateProductOption,
    updateProductOptionByOneSId,
    updateProductOptionIsDefault,
    updateProductOptionsProductInfo,
    updateImportProductsStatus
};
