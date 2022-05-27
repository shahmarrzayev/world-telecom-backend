const winston = require('winston');

const { mapCategoryEntityToCategoryView } = require('../mapper/categoryMapper');
const {
    getContentForAdminCreateProduct,
    getContentForAdminCreateProductOption,
    getContentForAdminProducts,
    getContentForHomePage,
    getContentForProductsPage,
    getWebsiteContent,
} = require('../service/contentService');

const getContentForAdminCreateProductController = async (req, res) => {
    winston.debug('contentController.getContentForAdminCreateProduct -- start');
    const content = await getContentForAdminCreateProduct();
    winston.debug('contentController.getContentForAdminCreateProduct -- success');
    return res.send(content);
};

const getContentForAdminCreateProductOptionController = async (req, res) => {
    winston.debug('contentController.getContentForAdminCreateProductOption -- start');
    const result = await getContentForAdminCreateProductOption();
    winston.debug('contentController.getContentForAdminCreateProductOption -- success');
    return res.send(result);
};

const getContentForAdminProductsController = async (req, res) => {
    winston.debug('contentController.getContentForAdminProducts -- start');
    const result = await getContentForAdminProducts();
    winston.debug('contentController.getContentForAdminProducts -- success');
    return res.send(result);
};

const getContentForHomePageController = async (req, res) => {
    winston.debug('contentController.getContentForHomePage -- start');
    const content = await getContentForHomePage();
    winston.debug('contentController.getContentForHomePage -- success');
    return res.send(content);
};

const getContentForProductsPageController = async (req, res) => {
    winston.debug('contentController.getContentForProductsPage -- start');
    const result = await getContentForProductsPage(req.query.categorySlug);
    winston.debug('contentController.getContentForProductsPage -- success');
    return res.send(result);
};

const getWebsiteContentController = async (req, res) => {
    winston.debug('contentController.getWebsiteContent -- start');
    const { campaigns, categories } = await getWebsiteContent();
    const categoriesView = categories.map(mapCategoryEntityToCategoryView);
    winston.debug('contentController.getWebsiteContent -- success');
    return res.send({ campaigns, categories: categoriesView });
};

module.exports = {
    getContentForAdminCreateProductController,
    getContentForAdminCreateProductOptionController,
    getContentForAdminProductsController,
    getContentForHomePageController,
    getContentForProductsPageController,
    getWebsiteContentController,
};
