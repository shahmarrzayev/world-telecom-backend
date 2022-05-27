const winston = require('winston');

const { ConflictException, GeneralException, NotFoundException } = require('../exceptions');
const { mapPromotionViewToPromotionEntity } = require('../mapper/promotionMapper');
const { findProductById } = require('../repository/productRepository');
const {
    countActivePromotions,
    deleteManyPromotions,
    findAllPromotions,
    savePromotion,
    updatePromotion,
} = require('../repository/promotionRepository');

/**
 * Add new promotion.
 * @param {PromotionView} promotion
 * @param {String} userId
 * @returns {Promise<PromotionEntity>}
 */
const addNewPromotion = async (promotion, userId) => {
    winston.debug('promotionService.addNewPromotion -- start');
    if (!promotion || !userId) {
        winston.warn(`promotionService.addNewPromotion -- unll param: ${promotion}, ${userId}`);
        throw new GeneralException();
    }

    const product = await findProductById(promotion.productId);
    if (!product) {
        winston.warn('promotionService.addNewPromotion -- product not found');
        throw new NotFoundException('Məhsul tapılmadı');
    }

    if (promotion.active) {
        const activePromotionsCount = await countActivePromotions();
        if (activePromotionsCount && activePromotionsCount.length === 3) {
            winston.warn('promotionService.addNewPromotion -- at most 3 active promotions allowed');
            throw new ConflictException('Maksimum 3 aktiv reklam ola bilər');
        }
    }

    let promotionEntity = mapPromotionViewToPromotionEntity(promotion);
    promotionEntity.createdBy = userId;
    promotionEntity = await savePromotion(promotionEntity);
    if (!promotionEntity) {
        winston.warn('promotionService.addNewPromotion -- could not save promotion');
        throw new GeneralException();
    }
    winston.debug('promotionService.addNewPromotion -- success');
    return promotionEntity;
};

/**
 * Get all promotions.
 * @returns {Promise<Array<PromotionEntity>>}
 */
const getAllPromotions = async () => {
    winston.debug('promotionService.getAllPromotions -- start');
    const promotions = await findAllPromotions();
    if (!promotions) {
        winston.warn('promotionService.getAllPromotions -- could not get promotions');
        throw new GeneralException();
    }
    winston.debug('promotionService.getAllPromotions -- success');
    return promotions;
};

/**
 * Update promotion.
 * @param {String} id
 * @param {PromotionView} promotion
 * @param {String} userId
 * @returns {Promise<PromotionEntity>}
 */
const modifyPromotion = async (id, promotion, userId) => {
    winston.debug('promotionService.modifyPromotion -- start');
    if (!id || !promotion || !userId) {
        winston.warn(`promotionService.modifyPromotion -- null param: ${id}, ${promotion}, ${userId}`);
        throw new GeneralException();
    }

    let promotionEntity = mapPromotionViewToPromotionEntity(promotion);
    promotionEntity.updatedBy = userId;
    promotionEntity = await updatePromotion(id, promotion);
    if (!promotionEntity) {
        winston.warn('promotionService.modifyPromotion -- could not update promotion');
        throw new GeneralException();
    }
    winston.debug('promotionService.modifyPromotion -- success');
    return promotionEntity;
};

/**
 * Delete many promotions by ids.
 * @param {Arrat<String>} ids
 */
const removeManyPromotions = async ids => {
    winston.debug('promotionService.removeManyPromotions -- start');
    if (!ids || !ids.length) {
        winston.warn('promotionService.removeManyPromotions -- null param');
        throw new GeneralException();
    }
    const promotionsDeleted = await deleteManyPromotions(ids);
    if (!promotionsDeleted) {
        winston.warn('promotionService.removeManyPromotions -- could not delete promotions');
        throw new GeneralException();
    }
    winston.debug('promotionService.removeManyPromotions -- success');
};

module.exports = {
    addNewPromotion,
    getAllPromotions,
    modifyPromotion,
    removeManyPromotions,
};
