const winston = require('winston');

const { Cache } = require('../enums');
const { ConflictException, NotFoundException, GeneralException } = require('../exceptions');
const { mapManufacturerViewToManufacturerEntity } = require('../mapper/manufacturerMapper');
const {
    deleteManyManufacturers,
    findAllManufacturers,
    findManufacturerByName,
    saveManufacturer,
    updateManufacturer,
} = require('../repository/manufacturerRepository');
const { updateManufacturerInProducts } = require('../repository/productRepository');
const { getFromCache, flushCache, setInCache } = require('../utils/cacheUtils');

/**
 * Add new manufacturer.
 * @param {ManufacturerView} manufacturerView
 * @param {String} userId
 * @returns {Promise<ManufacturerEntity>}
 */
const addNewManufacturer = async (manufacturerView, userId) => {
    winston.debug('manufacturerService.addNewManufacturer -- start');
    if (!manufacturerView || !userId) {
        winston.warn(`manufacturerService.addNewManufacturer -- null param: ${manufacturerView}, ${userId}`);
        throw new GeneralException();
    }

    const manufacturerNameExists = await findManufacturerByName(manufacturerView.name);
    if (manufacturerNameExists) {
        winston.warn('manufacturerService.addNewManufacturer -- manufacturer already exists');
        throw new ConflictException('Brend artıq mövcüddur');
    }

    const manufacturerEntity = mapManufacturerViewToManufacturerEntity(manufacturerView);
    manufacturerEntity.createdBy = userId;
    const savedManufacturerEntity = await saveManufacturer(manufacturerEntity);
    if (!savedManufacturerEntity) {
        winston.warn('manufacturerService.addNewManufacturer -- could not save manufacturer');
        throw new GeneralException();
    }

    flushCache();
    winston.debug('manufacturerService.addNewManufacturer -- success');
    return savedManufacturerEntity;
};

/**
 * Get all manufacturers.
 * @returns {Promise<Array<ManufacturerEntity>>}
 */
const getAllManufacturers = async () => {
    winston.debug('manufacturerService.getAllManufacturers -- start');
    let manufacturers = getFromCache(Cache.MANUFACTURERS);
    if (manufacturers) return manufacturers;

    manufacturers = await findAllManufacturers();
    if (!manufacturers) {
        winston.warn('manufacturerService.getAllManufacturers -- could not get manufacturers');
        throw new GeneralException();
    }

    setInCache(Cache.MANUFACTURERS, manufacturers);
    winston.debug('manufacturerService.getAllManufacturers -- success');
    return manufacturers;
};

/**
 * Update manufacturer information.
 * @param {String} id
 * @param {ManufacturerView} manufacturerView
 * @param {String} userId
 * @param {Transaction} transaction (optional)
 * @returns {Promise<ManufacturerEntity>}
 */
const modifyManufacturer = async (id, manufacturerView, userId, transaction) => {
    winston.debug('manufacturerService.modifyManufacturer -- start');
    if (!id || !manufacturerView || !userId) {
        winston.warn(`manufacturerService.modifyManufacturer -- null param: ${id}, ${userId}`);
        throw new GeneralException();
    }

    const entity = mapManufacturerViewToManufacturerEntity(manufacturerView);
    entity.updatedBy = userId;

    const [updatedManufacturer, updatedInProducts] = await Promise.all([
        updateManufacturer(id, entity, transaction),
        updateManufacturerInProducts(entity.name, manufacturerView.name, transaction),
    ]);

    if (!updatedManufacturer || !updatedInProducts) {
        winston.warn('manufacturerService.modifyManufacturer -- manufacturer not found');
        throw new NotFoundException();
    }

    flushCache();
    winston.debug('manufacturerService.modifyManufacturer -- success');
    return updatedManufacturer;
};

/**
 * Remove many manufacturers.
 * @param {Array<String>} ids
 */
const removeManyManufacturers = async ids => {
    winston.debug('manufacturerService.removeManyManufacturers -- start');
    if (!ids || !ids.length) {
        winston.warn('manufacturerService.removeManyManufacturers -- null or empty param');
        throw new GeneralException();
    }

    const manufacturersDeleted = await deleteManyManufacturers(ids);
    if (!manufacturersDeleted) {
        winston.warn('manufacturerService.removeManyManufacturers -- could not delete manufacturers');
        throw new GeneralException();
    }

    flushCache();
    winston.debug('manufacturerService.removeManyManufacturers -- success');
};

module.exports = {
    addNewManufacturer,
    getAllManufacturers,
    modifyManufacturer,
    removeManyManufacturers,
};
