const winston = require('winston');

const { runQuery } = require('./helper/repositoryHelper');
const Manufacturer = require('./models/manufacturerModel');

const deleteManyManufacturers = async (ids, transaction) => {
    winston.debug('manufacturerRepository.deleteManyManufacturers -- start');
    if (!ids || !ids.length) {
        winston.warn('manufacturerRepository.deleteManyManufacturers -- null or empty param');
        return null;
    }
    const queryResult = await runQuery(() => Manufacturer.deleteMany({ _id: { $in: ids } }, { session: transaction }));
    winston.debug('manufacturerRepository.deleteManyManufacturers -- success');
    return queryResult;
};

const findAllManufacturers = async transaction => {
    winston.debug('manufacturerRepository.findAllManufacturers -- start');
    const manufacturers = await runQuery(() => Manufacturer.find({ session: transaction }));
    winston.debug('manufacturerRepository.findAllManufacturers -- success');
    return manufacturers;
};

const findManufacturerById = async (id, transaction) => {
    winston.debug('manufacturerRepository.findManufacturerById -- start');
    if (!id) {
        winston.warn('manufacturerRepository.findManufacturerById -- null param');
        return null;
    }
    const manufacturer = await runQuery(() => Manufacturer.findById(id).session(transaction));
    winston.debug('manufacturerRepository.findManufacturerById -- success');
    return manufacturer;
};

const findManufacturerByName = async (name, transaction) => {
    winston.debug('manufacturerRepository.findManufacturerByName -- start');
    if (!name) {
        winston.warn('manufacturerRepository.findManufacturerByName -- null param');
        return null;
    }
    const manufacturer = await runQuery(() => Manufacturer.findOne({ name }).session(transaction));
    winston.debug('manufacturerRepository.findManufacturerByName -- success');
    return manufacturer;
};

const saveManufacturer = async (manufacturer, transaction) => {
    winston.debug('manufacturerRepository.saveManufacturer -- start');
    if (!manufacturer) {
        winston.warn('manufacturerRepository.saveManufacturer -- null param');
        return null;
    }
    const dbManufacturer = new Manufacturer(manufacturer);
    const savedManufacturer = await runQuery(() => dbManufacturer.save({ session: transaction }));
    winston.debug('manufacturerRepository.saveManufacturer -- success');
    return savedManufacturer;
};

const updateManufacturer = async (id, manufacturer, transaction) => {
    winston.debug('manufacturerRepository.updateManufacturer -- start');
    if (!id || !manufacturer) {
        winston.debug(`manufacturerRepository.updateManufacturer -- null param: ${id}, ${manufacturer}`);
        return null;
    }
    const updatedManufacturer = await runQuery(() =>
        Manufacturer.findOneAndUpdate({ _id: id }, manufacturer, {
            session: transaction,
        })
    );
    winston.debug('manufacturerRepository.updateManufacturer -- success');
    return updatedManufacturer;
};

module.exports = {
    deleteManyManufacturers,
    findAllManufacturers,
    findManufacturerById,
    findManufacturerByName,
    saveManufacturer,
    updateManufacturer,
};
