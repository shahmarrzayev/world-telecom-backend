const winston = require('winston');

const { hashPassword, verifyPassword } = require('./helper/authHelper');
const { Cache } = require('../enums');
const { GeneralException, ConflictException, NotFoundException, UnauthorizedException } = require('../exceptions');
const { mapSaveCustomerToEntity } = require('../mapper/customerMapper');
const {
    findCustomerByPhone,
    findCustomerById,
    saveCustomer,
    updateCustomer,
} = require('../repository/customerRepository');
const { findOrdersByMobilePhone } = require('../repository/orderRepository');
const { flushCache, getFromCache, setInCache } = require('../utils/cacheUtils');


const { generateToken, setAuthHeaders } = require('./helper/authHelper');


/**
 * Change customer password.
 * @param {CustomerEntity} customer
 * @param {String} currentPass
 * @param {String} newPass
 * @returns {Promise<CustomerEntity>}
 */
const changePassword = async (customer, currentPass, newPass) => {
    winston.debug('customerService.changePassword -- start');
    if (!customer || !currentPass || !newPass) {
        winston.warn('customerService.changePassword -- invalid args');
        throw new GeneralException();
    }

    const currentPassCorrect = await verifyPassword(customer.password, currentPass);
    if (!currentPassCorrect) {
        winston.debug('customerService.changePassword -- invalid password');
        throw new UnauthorizedException();
    }

    customer.password = await hashPassword(newPass);
    if (!customer.password) {
        winston.warn('customerService.changePassword -- could not hash');
        throw new GeneralException();
    }

    const customerEntity = await updateCustomer(customer._id, customer);
    if (!customerEntity) {
        winston.warn('customerService.changePassword -- could not update');
        throw new GeneralException();
    }
    winston.debug('customerService.changePassword -- success');
    return customerEntity;
};

/**
 * Get customer by id.
 * @param {ObjectId} id
 * @returns {Promise<CustomerEntity>}
 */
const getCustomerById = async (id, returnNull) => {
    winston.debug('customerService.getById -- start');
    if (!id) {
        winston.warn('customerService.getById -- invalid arg');
        throw new GeneralException();
    }

    let customer = await getFromCache(`${Cache.CUSTOMERS}-${id}`);
    if (!customer) {
        customer = await findCustomerById(id);

        if (!customer) {
            winston.debug('customerService.getById -- not found');
            if (returnNull) return null;
            throw new NotFoundException('İstifadəçi tapılmadı ');
        }

        setInCache(`${Cache.CUSTOMERS}-${id}`, customer);
    }
    winston.debug('customerService.getById -- success');
    return customer;
};

/**
 * Get customer's orders.
 * @param {CustomerEntity} customer
 * @returns {Promise<OrderEntity>}
 */
const getCustomerOrders = async (customer) => {
    winston.debug('customerService.getCustomerOrders -- start');
    if (!customer) {
        winston.warn('customerService.getCustomerOrders -- invalid args');
        throw new GeneralException();
    }

    const orders = await findOrdersByMobilePhone(customer.mobilePhone);
    winston.debug('customerService.getCustomerOrders -- success');
    return orders || [];
};

/**
 * Update customer.
 * @param {CustomerEntity} customer
 * @returns {Promise<CustomerEntity>}
 */
const modifyCustomer = async (customer, modifiedCustomerInfos) => {
    winston.debug('customerService.modifyCustomer -- start');
    if (!modifiedCustomerInfos) {
        winston.warn('customerService.modifyCustomer -- invalid args');
        throw new GeneralException();
    }

    let customerEntity = mapSaveCustomerToEntity(modifiedCustomerInfos);
    customerEntity = await updateCustomer(customer._id, customerEntity);
    if (!customerEntity) {
        winston.warn('customerService.modifyCustomer -- could not update');
        throw new GeneralException();
    }

    flushCache();
    winston.debug('customerService.modifyCustomer -- success');
    return customerEntity;
};

/**
 * Registers new customer.
 * @param {SaveCustomerDto} customer
 * @returns {Promise<CustomerEntity>}
 */
const registerCustomer = async (res, customer) => {
    winston.debug('customerService.registerCustomer -- start');
    if (!customer) {
        winston.warn('customerService.registerCustomer -- invalid arg');
        throw new GeneralException();
    }

    const customerExists = await findCustomerByPhone(customer.mobilePhone);
    if (customerExists) {
        winston.debug('customerService.registerCustomer -- customer exists');
        throw new ConflictException('İstifadəçi mövcüddur');
    }

    let entity = mapSaveCustomerToEntity(customer);
    entity.isActive = true;
    entity.password = await hashPassword(customer.password);
    if (!entity.password) {
        winston.warn('customerService.registerCustomer -- could not hash password');
        throw new GeneralException();
    }

    entity = await saveCustomer(entity);
    if (!entity) {
        winston.warn('customerService.registerCustomer -- could not save');
        throw new GeneralException();
    }

    // Set auth header

    const accessToken = generateToken(entity._id, entity.mobilePhone);
    const refreshToken = generateToken(entity._id, entity.mobilePhone, true);

    if (!accessToken || !refreshToken) {
        winston.warn(`customerService.registerCustomer -- couldn't generate token: ${accessToken}, ${refreshToken}`);
        throw new GeneralException();
    }

    const headersAreSet = setAuthHeaders(res, accessToken, refreshToken);
    if (!headersAreSet) {
        winston.warn('customerService.registerCustomer -- couldn not set headers');
        throw new GeneralException();
    }

    winston.debug('customerService.registerCustomer -- success');
    return entity;
};

module.exports = {
    changePassword,
    getCustomerById,
    getCustomerOrders,
    modifyCustomer,
    registerCustomer,
};
