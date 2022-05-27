const express = require('express');

const {
    generateProductsFileController,
    generateProductParamsFileController,
    generateXmlFeedsFileController,
    processNumbersFileController,
    processOneSPricesFileController,
    processProductOptionIdToOneSIdMappingFileController,
    uploadFileToStorageController,
    processManyProductOptionsFromFileController,
    processCampaignsFileController
} = require('../../controller/fileController');
const { UserRole } = require('../../enums');
const multer = require('../../middleware/multerMw');
const role = require('../../middleware/roleMw');
const transaction = require('../../middleware/transactionMw');

const router = express.Router();

router.get('/products', role(UserRole.ADMIN), generateProductsFileController);
router.get('/products-params', role(UserRole.ADMIN), generateProductParamsFileController);

router.post('/one-s-prices', role(UserRole.CONTENT_MANAGER), multer.single('file'), transaction, processOneSPricesFileController);
router.post('/product-option-one-s', role(UserRole.CONTENT_MANAGER), multer.single('file'), transaction, processProductOptionIdToOneSIdMappingFileController);
router.post('/', role(UserRole.CONTENT_MANAGER), multer.single('file'), transaction, uploadFileToStorageController);
router.post('/numbers', role(UserRole.CONTENT_MANAGER), multer.single('file'), transaction, processNumbersFileController
);
router.post('/xml-product-feed', role(UserRole.CONTENT_MANAGER), generateXmlFeedsFileController);

router.post('/product-option-excel', role(UserRole.CONTENT_MANAGER), multer.single('file'), transaction, processManyProductOptionsFromFileController);
router.post('/campaign-excel', role(UserRole.CONTENT_MANAGER), multer.single('file'), transaction, processCampaignsFileController);

module.exports = router;
