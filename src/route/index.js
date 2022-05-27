const customerAddressRoute = require('./customer/customerAddressRoute');
const customerCartRoute = require('./customer/customerCartRoute');
const customerFavoritesRoute = require('./customer/customerFavoritesRoute');
const customerProfileRoute = require('./customer/customerProfile');

const bannerRoute = require('./private/bannerRoute');
const branchRoute = require('./private/branchRoute');
const campaignRoute = require('./private/campaignRoute');
const campaignArticlesRoute = require('./private/campaignArticlesRoute');
const categoryRoute = require('./private/categoryRoute');
const contentRoute = require('./private/contentRoute');
const fileRoute = require('./private/fileRoute');
const filterRoute = require('./private/filterRoute');
const loanRequestRoute = require('./private/loanRequestRoute');
const loanRoute = require('./private/loanRoute');
const manufacturerRoute = require('./private/manufacturerRoute');
const newsRoute = require('./private/newsRoute');
const numberRoute = require('./private/numberRoute');
const orderRoute = require('./private/orderRoute');
const parameterRoute = require('./private/parameterRoute');
const parameterTemplateRoute = require('./private/parameterTemplatesRoute');
const paymentRoute = require('./private/paymentRoute');
const productRoute = require('./private/productRoute');
const promotionRoute = require('./private/promotionRoute');
const roleRoute = require('./private/roleRoute');
const statisticsRoute = require('./private/statisticsRoute');
const userActivityRoute = require('./private/userActivityRoute');
const userRoute = require('./private/userRoute');

const settingRoute = require('./private/settingRoute');
const seoPagePrivateRoute = require('./private/seoPageRoute');
const seoPageRoute = require('./public/seoPageRoute');

const publicAuthRoute = require('./public/authRoute');
const publicBranchRoute = require('./public/branchRoute');
const publicCampaignArticlesRoute = require('./public/campaignArticles');
const publicContentRoute = require('./public/contentRoute');
const publicCustomerRoute = require('./public/customerRoute');
const publicDeviceInfoRoute = require('./public/deviceInfoRoute');
const publicFilterRequestRoute = require('./public/filterRoute');
const publicLoanRequestRoute = require('./public/loanRequestRoute');
const publicNewsRouter = require('./public/newsRoute');
const publicNumberRoute = require('./public/numberRoute');
const publicOrderRoute = require('./public/orderRoute');
const publicPaymentRoute = require('./public/paymentRoute');
const publicProductRoute = require('./public/productRoute');
const publicProductOptionRoute = require('./public/productOptionRoute');


const applyRoutes = app => {
    /** Customer */
    app.use('/api/customer/address', customerAddressRoute);
    app.use('/api/customer/cart', customerCartRoute);
    app.use('/api/customer/favorites', customerFavoritesRoute);
    app.use('/api/customer/profile', customerProfileRoute);

    /** Private */
    app.use('/api/internal/banners', bannerRoute);
    app.use('/api/internal/branches', branchRoute);
    app.use('/api/internal/campaigns', campaignRoute);
    app.use('/api/internal/campaign-articles', campaignArticlesRoute);
    app.use('/api/internal/categories', categoryRoute);
    app.use('/api/internal/content', contentRoute);
    app.use('/api/internal/file', fileRoute);
    app.use('/api/internal/filter', filterRoute);
    app.use('/api/internal/loans', loanRoute);
    app.use('/api/internal/loan-requests', loanRequestRoute);
    app.use('/api/internal/manufacturers', manufacturerRoute);
    app.use('/api/internal/news', newsRoute);
    app.use('/api/internal/numbers', numberRoute);
    app.use('/api/internal/orders', orderRoute);
    app.use('/api/internal/parameters', parameterRoute);
    app.use('/api/internal/payments', paymentRoute);
    app.use('/api/internal/products', productRoute);
    app.use('/api/internal/promotions', promotionRoute);
    app.use('/api/internal/roles', roleRoute);
    app.use('/api/internal/statistics', statisticsRoute);
    app.use('/api/internal/seo-page', seoPagePrivateRoute)
    app.use('/api/internal/setting', settingRoute);
    app.use('/api/internal/templates', parameterTemplateRoute);
    app.use('/api/internal/users', userRoute);
    app.use('/api/internal/user-activities', userActivityRoute);
        
    

    /** Public */
    app.use('/api/auth', publicAuthRoute);
    app.use('/api/branches', publicBranchRoute);
    app.use('/api/campaign-articles', publicCampaignArticlesRoute);
    app.use('/api/content', publicContentRoute);
    app.use('/api/customers', publicCustomerRoute);
    app.use('/api/device-info', publicDeviceInfoRoute);
    app.use('/api/filter/', publicFilterRequestRoute);
    app.use('/api/loan-requests', publicLoanRequestRoute);
    app.use('/api/news', publicNewsRouter);
    app.use('/api/numbers', publicNumberRoute);
    app.use('/api/orders', publicOrderRoute);
    app.use('/api/payments', publicPaymentRoute);
    app.use('/api/products/', publicProductRoute);
    app.use('/api/product-options', publicProductOptionRoute);
    app.use('/api/seo-page', seoPageRoute);
};

module.exports = applyRoutes;
