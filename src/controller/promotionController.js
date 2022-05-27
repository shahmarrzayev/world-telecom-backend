const winston = require('winston');

const { validatePromotion } = require('./validator/promotionValidator');
const { validateArrayOfObjectIds } = require('./validator/commonValidator');
const { BadRequestException } = require('../exceptions');
const { mapPromotionEntityToPromotionView } = require('../mapper/promotionMapper');
const {
    addNewPromotion,
    getAllPromotions,
    modifyPromotion,
    removeManyPromotions,
} = require('../service/promotionService');

const addNewPromotionController = async (req, res) => {
    winston.debug('promotionController.addNewPromotion -- start');
    const { body, user } = req;
    const error = validatePromotion(body);
    if (error) {
        winston.warn(`promotionController.addNewPromotion -- ${error}`);
        throw new BadRequestException(error);
    }
    const promotion = await addNewPromotion(body, user._id);
    winston.debug('promotionController.addNewPromotion -- success');
    return res.send(mapPromotionEntityToPromotionView(promotion));
};

const getAllPromotionsController = async (req, res) => {
    winston.debug('promotionController.getAllPromotions -- start');
    const promotions = await getAllPromotions();
    winston.debug('promotionController.getAllPromotions -- success');
    return res.send(promotions.map(mapPromotionEntityToPromotionView));
};

const modifyPromotionController = async (req, res) => {
    winston.debug('promotionController.modifyPromotion -- start');
    const { body, params, user } = req;
    const error = validatePromotion(body);
    if (error) {
        winston.warn(`promotionController.modifyPromotion -- ${error}`);
        throw new BadRequestException(error);
    }
    const promotion = await modifyPromotion(params.id, req.body, user._id);
    winston.debug('promotionController.modifyPromotion -- success');
    return res.send(mapPromotionEntityToPromotionView(promotion));
};

const removeManyPromotionsController = async (req, res) => {
    winston.debug('promotionController.removeManyPromotions -- start');
    const { body } = req;
    const error = validateArrayOfObjectIds(body);
    if (error) {
        winston.warn(`promotionController.removeManyPromotions -- ${error}`);
        throw new BadRequestException(error);
    }
    await removeManyPromotions(body);
    winston.debug('promotionController.removeManyPromotions -- success');
    return res.send();
};

module.exports = {
    addNewPromotionController,
    getAllPromotionsController,
    modifyPromotionController,
    removeManyPromotionsController,
};
