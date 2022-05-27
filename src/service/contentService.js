const winston = require('winston');

const { Cache } = require('../enums');
const { assignSubcategories } = require('./helper/categoryHelper');
const { detectColors } = require('./helper/productHelper');
const { mapBannerEntityToBannerView } = require('../mapper/bannerMapper');
const { mapCampaignEntityToCampaignView, mapCampaignEntityToCampaignViewAdmin } = require('../mapper/campaignsMapper');
const { mapCategoryEntityToCategoryViewAdmin, mapCategoryEntityToCategoryView } = require('../mapper/categoryMapper');
const { mapLoanEntityToLoanViewAdmin } = require('../mapper/loanMapper');
const { mapManufacturerEntityToManufacturerView } = require('../mapper/manufacturerMapper');
const { mapTemplateEntityToTemplateView } = require('../mapper/parameterTemplateMapper');
const { mapFilterEntityToView } = require('../mapper/filterMapper')
const { mapProductEntityToView } = require('../mapper/productMapper');
const { findAllBanners } = require('../repository/bannerRepository');
const { findAllCampaigns } = require('../repository/campaignRepository');
const { findAllCategories } = require('../repository/categoryRepository');
const { findAllLoans } = require('../repository/loanRepository');
const { findAllManufacturers } = require('../repository/manufacturerRepository');
const { findAllTemplates } = require('../repository/parameterTemplateRepository');
const { findDistinctMemories } = require('../repository/productOptionRepository');
const {
    findDistinctManufacturersForCategory,
    findNewProducts,
    findPopularProducts,
} = require('../repository/productRepository');
const { getFromCache, setInCache } = require('../utils/cacheUtils');
const { sortMemories } = require('../utils/commonUtils');
const { findFiltersByCategoryName } = require('../repository/filterRepository');

/**
 * Create product page (admin).
 */
const getContentForAdminCreateProduct = async () => {
    winston.debug('contentService.getContentForAdminCreateProduct -- start');
    let content = getFromCache(Cache.CONTENT_ADMIN_CREATE_PRODUCT);
    if (content) return content;
    let [categories, manufacturers] = await Promise.all([findAllCategories(), findAllManufacturers()]);

    categories = categories.map(mapCategoryEntityToCategoryViewAdmin);
    manufacturers = manufacturers.map(mapManufacturerEntityToManufacturerView);

    content = { categories, manufacturers };
    setInCache(Cache.CONTENT_ADMIN_CREATE_PRODUCT, content);
    winston.debug('contentService.getContentForAdminCreateProduct -- success');
    return content;
};

/**
 * Create product option page (admin).
 */
const getContentForAdminCreateProductOption = async () => {
    winston.debug('contentService.getContentForAdminCreateProductOption -- start');
    let content = getFromCache(Cache.CONTENT_ADMIN_CREATE_PRODUCT_OPTION);
    let [campaigns, loans, templates] = await Promise.all([findAllCampaigns(), findAllLoans(), findAllTemplates()]);

    campaigns = campaigns.map(mapCampaignEntityToCampaignViewAdmin);
    loans = loans.map(mapLoanEntityToLoanViewAdmin);
    templates = templates.map(mapTemplateEntityToTemplateView);

    content = { campaigns, loans, templates };
    setInCache(Cache.CONTENT_ADMIN_CREATE_PRODUCT_OPTION, content);
    winston.debug('contentService.getContentForAdminCreateProductOption -- success');
    return content;
};

/**
 * Products page (admin).
 */
const getContentForAdminProducts = async () => {
    winston.debug('contentService.getContentForAdminProducts -- start');
    let content = getFromCache(Cache.CONTENT_ADMIN_PRODUCTS);
    if (content) return content;

    let [campaigns, categories, manufacturers] = await Promise.all([
        findAllCampaigns(),
        findAllCategories(),
        findAllManufacturers(),
    ]);

    campaigns = campaigns.map(mapCampaignEntityToCampaignViewAdmin);
    categories = categories.map(mapCategoryEntityToCategoryViewAdmin);
    manufacturers = manufacturers.map(mapManufacturerEntityToManufacturerView);

    content = { campaigns, categories, manufacturers };
    setInCache(Cache.CONTENT_ADMIN_PRODUCTS, content);
    winston.debug('contentService.getContentForAdminProducts -- success');
    return content;
};

/**
 * Home page.
 */
const getContentForHomePage = async () => {
    winston.debug('contentService.getContentForHomePage -- start');
    let content = getFromCache(Cache.CONTENT_HOME_PAGE);
    if (!content) {
        let [banners, campaigns, newProducts, popularProducts, categories] = await Promise.all([
            findAllBanners(),
            findAllCampaigns(),
            findNewProducts(),
            findPopularProducts(),
            findAllCategories(),
        ]);
        categories = await assignSubcategories(categories);

        banners = banners.map(mapBannerEntityToBannerView);
        campaigns = campaigns.map(mapCampaignEntityToCampaignView);
        categories = categories.map(mapCategoryEntityToCategoryView);

        popularProducts = popularProducts.map(p => mapProductEntityToView(p, true));
        popularProducts.forEach(p => {
            p.options = p.options && p.options.length ? p.options.filter(o => o.published) : [];
            p.availableColors = detectColors(p.options, p.memoryOptions);
        });

        newProducts = newProducts.map(p => mapProductEntityToView(p, true));
        newProducts.forEach(p => {
            p.options = p.options && p.options.length ? p.options.filter(o => o.published) : [];
            p.availableColors = detectColors(p.options, p.memoryOptions);
        });

        content = { banners, campaigns, categories, newProducts, popularProducts };
        setInCache(Cache.CONTENT_HOME_PAGE, content);
    }
    winston.debug('contentService.getContentForHomePage -- success');
    return content;
};

/**
 * Products page.
 */
const getContentForProductsPage = async categorySlug => {
    winston.debug('contentService.getContentForProductsPage -- start');
    let content = getFromCache(`${Cache.CONTENT_PRODUCTS_PAGE}${categorySlug}`);
    if (!content) {
        let [campaigns, categories, memories, parameterFilters] = await Promise.all([
            findAllCampaigns(),
            findAllCategories(),
            findDistinctMemories(),
            findFiltersByCategoryName(categorySlug)
        ]);
        memories = sortMemories(memories);
        categories = await assignSubcategories(categories);
        campaigns = campaigns.map(mapCampaignEntityToCampaignView);
        categories = categories.map(mapCategoryEntityToCategoryView);
        parameterFilters = parameterFilters.map(mapFilterEntityToView);
        content = { campaigns, categories, memories, parameterFilters };
        setInCache(`${Cache.CONTENT_PRODUCTS_PAGE}${categorySlug}`, content);
    }

    let manufacturers = getFromCache(`${Cache.DISTINCT_MANUFACTURERS_FOR_CATEGORY}${categorySlug}`);
    if (!manufacturers) {
        manufacturers = await findDistinctManufacturersForCategory(categorySlug);
        manufacturers.map(mapManufacturerEntityToManufacturerView);
        setInCache(`${Cache.DISTINCT_MANUFACTURERS_FOR_CATEGORY}${categorySlug}`, manufacturers);
    }
    content.manufacturers = manufacturers;
    winston.debug('contentService.getContentForProductsPage -- success');
    return content;
};

/**
 * Whole website content.
 */
const getWebsiteContent = async () => {
    winston.debug('contentService.getWebsiteContent -- start');
    let content = getFromCache(Cache.CONTENT_WEBSITE);
    if (!content) {
        let [categories, campaigns] = await Promise.all([findAllCategories(), findAllCampaigns()]);
        categories = await assignSubcategories(categories);
        campaigns = campaigns.map(mapCampaignEntityToCampaignView);
        content = { campaigns, categories };
        setInCache(Cache.CONTENT_WEBSITE, content);
    }
    winston.debug('contentService.getWebsiteContent -- success');
    return content;
};

module.exports = {
    getContentForAdminCreateProduct,
    getContentForAdminCreateProductOption,
    getContentForAdminProducts,
    getContentForHomePage,
    getContentForProductsPage,
    getWebsiteContent,
};
