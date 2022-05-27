const winston = require('winston');

const { runQuery } = require('./helper/repositoryHelper');
const Promotion = require('./models/promotionModel');

const countActivePromotions = async transaction => {
    winston.debug('promotionRepository.countActivePromotions -- start');
    const count = await runQuery(() => Promotion.countDocuments({ active: true }).session(transaction));
    winston.debug('promotionRepository.countActivePromotions -- success');
    return count;
};

const deleteManyPromotions = async (ids, transaction) => {
    winston.debug('promotionRepository.deleteManyPromotions -- start');
    if (!ids || !ids.length) {
        winston.warn('promotionRepository.deleteManyPromotions -- null or empty param');
        return null;
    }
    const queryResult = await runQuery(() => Promotion.deleteMany({ _id: { $in: ids } }, { session: transaction }));
    winston.debug('promotionRepository.deleteManyPromotions -- success');
    return queryResult;
};

const findAllPromotions = async transaction => {
    winston.debug('promotionRepository.findAllPromotions -- start');
    const promotions = await runQuery(() => Promotion.find({}).session(transaction));
    winston.debug('promotionRepository.findAllPromotions -- success');
    return promotions;
};

const savePromotion = async (promotion, transaction) => {
    winston.debug('promotionRepository.savePromotion -- start');
    if (!promotion) {
        winston.warn('promotionRepository.savePromotion -- null param');
        return null;
    }
    const dbPromotion = new Promotion(promotion);
    const promotionEntity = await runQuery(() => dbPromotion.save({ session: transaction }));
    winston.debug('promotionRepository.savePromotion -- success');
    return promotionEntity;
};

const updatePromotion = async (id, promotion, transaction) => {
    winston.debug('promotionRepository.updatePromotion -- start');
    if (!id || !promotion) {
        winston.warn(`promotionRepository.updatePromotion -- null param: ${id}, ${promotion}`);
        return null;
    }
    const promotionEntity = await runQuery(() =>
        Promotion.findOneAndUpdate({ _id: id }, promotion, {
            new: true,
            session: transaction,
            useFindAndModify: false,
        })
    );
    winston.debug('promotionRepository.updatePromotion -- success');
    return promotionEntity;
};

module.exports = {
    countActivePromotions,
    deleteManyPromotions,
    findAllPromotions,
    savePromotion,
    updatePromotion,
};
