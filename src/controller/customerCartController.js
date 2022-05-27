const { PaymentType } = require('../enums');
const { mapCustomerEntityToPublicDto } = require('../mapper/customerMapper');
const { mapNumberEntityToNumberView } = require('../mapper/numberMapper');
const { mapOrderEntityToOrderView } = require('../mapper/orderMapper');
const { mapProductOptionEntityToView } = require('../mapper/productMapper');
const {
    addNumberToCart,
    addOptionToCart,
    checkoutCustomerCart,
    clearCart,
    getCustomerCart,
    removeItemFromCart,
    clearItemFromCart
} = require('../service/customerCartService');
const {
    createNewAzericardPayment,
    createNewPashaBankPayment,
    createNewYigimPayment,
    createNewUnibankPayment,
} = require('../service/paymentService');

const addNumberToCartController = async (req, res) => {
    const customer = await addNumberToCart(req.user, req.params.numberId);
    return res.send(mapCustomerEntityToPublicDto(customer));
};

const addOptionToCartController = async (req, res) => {
    const customer = await addOptionToCart(req.user, req.params.optionId);
    return res.send(mapCustomerEntityToPublicDto(customer));
};

const checkoutCustomerCartController = async (req, res) => {
    const { query, params, transaction, user } = req;

    const order = await checkoutCustomerCart(user, params.paymentType, query.installmentPeriod, transaction);

    let paymentUrl;
    if (order.paymentType === PaymentType.ONLINE) {
        paymentUrl = await createNewYigimPayment(order, transaction);
    } else if (order.paymentType === PaymentType.ONLINE_AZERICARD) {
        await createNewAzericardPayment(order, transaction);
    } else if (order.paymentType === PaymentType.ONLINE_PASHA_BANK) {
        order.installmentPeriod = query.installmentPeriod;
        paymentUrl = await createNewPashaBankPayment(order, req.ip, transaction);
    } else if (order.paymentType === PaymentType.ONLINE_UNIBANK) {
        paymentUrl = await createNewUnibankPayment(order, transaction);
    }

    const orderView = mapOrderEntityToOrderView(order);
    orderView.paymentUrl = paymentUrl;

    return res.send(orderView);
};

const clearCartController = async (req, res) => {
    const customer = await clearCart(req.user);
    return res.send(mapCustomerEntityToPublicDto(customer));
};

const getCustomerCartController = async (req, res) => {
    const cart = await getCustomerCart(req.user);
    cart.productOptions.forEach(po => {
        po.product = mapProductOptionEntityToView(po.product);
    });
    cart.numbers.forEach(n => {
        n.number = mapNumberEntityToNumberView(n.number);
    });
    return res.send(cart);
};

const removeItemFromCartController = async (req, res) => {
    const customer = await removeItemFromCart(req.user, req.params.optionId);
    return res.send(mapCustomerEntityToPublicDto(customer));
};

const clearItemFromCartController = async (req, res) => {
    const customer = await clearItemFromCart(req.user, req.params.optionId);
    return res.send(mapCustomerEntityToPublicDto(customer));
}

module.exports = {
    addNumberToCartController,
    addOptionToCartController,
    checkoutCustomerCartController,
    clearCartController,
    getCustomerCartController,
    removeItemFromCartController,
    clearItemFromCartController
};
