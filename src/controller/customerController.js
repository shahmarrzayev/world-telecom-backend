const { validateChangePassword, validateSaveCustomer, validateUpdateCustomer } = require('./validator/customerValidator');
const { BadRequestException } = require('../exceptions');

const { changePassword, getCustomerOrders, modifyCustomer, registerCustomer, getCustomerById } = require('../service/customerService');
const { mapCustomerEntityToPublicDto } = require('../mapper/customerMapper');
const { mapOrderEntityToOrderView } = require('../mapper/orderMapper');

const getCustomerOrdersController = async (req, res) => {
    const orders = await getCustomerOrders(req.user);
    return res.send(orders.map(mapOrderEntityToOrderView));
};

const changePasswordController = async (req, res) => {
    const error = validateChangePassword(req.body);
    if (error) throw new BadRequestException(error);
    const customer = await changePassword(req.user, req.body.currentPass, req.body.newPass);
    return res.send(mapCustomerEntityToPublicDto(customer));
};

const modifyCustomerController = async (req, res) => {
    const error = validateUpdateCustomer(req.body);
    if (error) throw new BadRequestException(error);
    const customer = await modifyCustomer(req.user, req.body);
    return res.send(mapCustomerEntityToPublicDto(customer));
};

const registerCustomerController = async (req, res) => {
    const error = validateSaveCustomer(req.body);
    if (error) throw new BadRequestException(error);
    const customer = await registerCustomer(res, req.body);
    return res.send(mapCustomerEntityToPublicDto(customer));
};

const getCustomerInfoController = async (req, res) => {
    const customer = await getCustomerById(req.user._id);
    return res.send(mapCustomerEntityToPublicDto(customer));
}

module.exports = {
    getCustomerOrdersController,
    changePasswordController,
    modifyCustomerController,
    registerCustomerController,
    getCustomerInfoController
};