const winston = require('winston');

const { runQuery } = require('./helper/repositoryHelper');
const Customer = require('./models/customerModel');

const findCustomerByEmail = async (email, transaction) => {
    winston.debug('customerRepository.findCustomerByEmail -- start');
    if (!email) {
        winston.warn('customerRepository.findCustomerByEmail -- null param');
        return null;
    }
    const customer = await runQuery(() => Customer.findOne({ email }).session(transaction));
    winston.debug('customerRepository.findCustomerByEmail -- success');
    return customer;
};

const findCustomerByPhone = async (mobilePhone, transaction) => {
    winston.debug('customerRepository.findCustomerByPhone -- start');
    if (!mobilePhone) {
        winston.warn('customerRepository.findCustomerByPhone -- null param');
        return null;
    }
    const customer = await runQuery(() => Customer.findOne({ mobilePhone }).session(transaction));
    winston.debug('customerRepository.findCustomerByPhone -- success');
    return customer;
}

const findCustomerById = async (id, transaction) => {
    if (!id) return null;
    const customer = await runQuery(() => Customer.findById(id).session(transaction));
    return customer;
};

const saveCustomer = async (customer, transaction) => {
    winston.debug('customerRepository.saveCustomer -- start');
    if (!customer) {
        winston.warn('customerRepository.saveCustomer -- null param');
        return null;
    }
    const dbCustomer = new Customer(customer);
    const customerEntity = await runQuery(() => dbCustomer.save({ session: transaction }));
    winston.debug('customerRepository.saveCustomer -- success');
    return customerEntity;
};

const updateCustomer = async (id, customer, transaction) => {
    winston.debug('customerRepository.updateCustomer -- start');
    if (!id || !customer) {
        winston.warn(`customerRepository.updateCustomer -- invalid args: ${id}, ${customer}`);
        return null;
    }
    
    const savedNews = await runQuery(() =>
        Customer.findByIdAndUpdate(id, customer, {
            new: true,
            session: transaction,
            useFindAndModify: false,
        })
    );
    
    winston.debug('customerRepository.updateCustomer -- success');
    return savedNews;
};

module.exports = {
    findCustomerByEmail,
    findCustomerByPhone,
    findCustomerById,
    saveCustomer,
    updateCustomer,
};
