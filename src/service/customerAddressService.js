const winston = require('winston');

const { GeneralException, NotFoundException } = require('../exceptions');
const { updateCustomer } = require('../repository/customerRepository');
const { flushCache } = require('../utils/cacheUtils');

/**
 * Add address to customer.
 * @param {CustomerEntity} customer
 * @param {AddressView} address
 * @returns {Promise<CustomerEntity>}
 */
const addAddress = async (customer, address) => {
    winston.debug('customerAddressService.addAddress -- start');
    if (!customer || !address) {
        winston.warn('customerAddressService.addAddress -- invalid args');
        throw new GeneralException();
    }

    customer.addresses.push(address);
    const customerEntity = await updateCustomer(customer._id, customer);
    if (!customerEntity) {
        winston.warn('customerAddressService.addAddress -- could not update');
        throw new GeneralException();
    }

    flushCache();
    winston.debug('customerAddressService.addAddress -- success');
    return customerEntity;
};

/**
 * Delete address from customer.
 * @param {CustomerEntity} customer
 * @param {ObjectId} addressId
 * @returns {Promise<CustomerEntity>}
 */
const deleteAddress = async (customer, addressId) => {
    winston.debug('customerAddressService.deleteAddress -- start');
    if (!customer || !addressId) {
        winston.warn('customerAddressService.deleteAddress -- invalid args');
        throw new GeneralException();
    }

    customer.addresses = customer.addresses.filter(a => a._id !== addressId);

    const customerEntity = await updateCustomer(customer._id, customer);
    if (!customerEntity) {
        winston.warn('customerAddressService.deleteAddress -- could not update');
        throw new GeneralException();
    }

    flushCache();
    winston.debug('customerAddressService.deleteAddress -- success');
    return customerEntity;
};

/**
 * Update customer's address
 * @param {CustomerEntity} customer
 * @param {AddressView} address
 * @returns {Promise<CustomerEntity>}
 */
const updateAddress = async (customer, address) => {
    winston.debug('customerAddressService.updateAddress -- start');
    if (!customer || !address) {
        winston.warn('customerAddressService.updateAddress -- invalid args');
        throw new GeneralException();
    }

    const { addresses } = customer;
    let addr = addresses && addresses.length ? addresses.find(a => a._id == address._id) : null;
    if (!addr) {
        winston.warn('customerAddressService.updateAddress -- address not found');
        throw new NotFoundException();
    }

    customer.addresses = customer.addresses.map(addr=> {
        if (addr._id === address._id){
            addr = address;
        }
        return address;
    })
    const customerEntity = await updateCustomer(customer._id, customer);
    if (!customerEntity) {
        winston.warn('customerAddressService.updateAddress -- could not update');
        throw new GeneralException();
    }

    flushCache();
    winston.debug('customerAddressService.updateAddress -- success');
    return customerEntity;
};

module.exports = {
    addAddress,
    deleteAddress,
    updateAddress,
};
