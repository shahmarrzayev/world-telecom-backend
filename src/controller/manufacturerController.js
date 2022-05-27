const winston = require('winston');

const { validateManufacturer } = require('./validator/manufacturerValidator');
const { validateArrayOfObjectIds } = require('./validator/commonValidator');
const { BadRequestException } = require('../exceptions');
const { mapManufacturerEntityToManufacturerView } = require('../mapper/manufacturerMapper');
const {
    addNewManufacturer,
    getAllManufacturers,
    modifyManufacturer,
    removeManyManufacturers,
} = require('../service/manufacturerService');

const addNewManufacturerController = async (req, res) => {
    winston.debug('manufacturerController.addNewManufacturer -- start');
    const { body, user } = req;
    const error = validateManufacturer(body);
    if (error) {
        winston.warn(`manufacturerController.addNewManufacturer -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    const manufacturerEntity = await addNewManufacturer(body, user._id);
    winston.debug('manufacturerController.addNewManufacturer -- success');
    return res.send(mapManufacturerEntityToManufacturerView(manufacturerEntity));
};

const getAllManufacturersController = async (req, res) => {
    winston.debug('manufacturerController.getAllManufacturers -- start');
    const manufacturers = await getAllManufacturers();
    winston.debug('manufacturerController.getAllManufacturers -- success');
    return res.send(manufacturers.map(mapManufacturerEntityToManufacturerView));
};

const modifyManufacturerController = async (req, res) => {
    winston.debug('manufacturerController.modifyManufacturer -- start');
    const { body, params, transaction, user } = req;
    const error = validateManufacturer(body);
    if (error) {
        winston.warn(`manufacturerController.modifyManufacturer -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    const manufacturerEntity = await modifyManufacturer(params.id, body, user._id, transaction);
    winston.debug('manufacturerController.modifyManufacturer -- success');
    return res.send(mapManufacturerEntityToManufacturerView(manufacturerEntity));
};

const removeManyManufacturersController = async (req, res) => {
    winston.debug('manufacturerController.removeManyManufacturers -- start');
    const { body } = req;
    const error = validateArrayOfObjectIds(body);
    if (error) {
        winston.warn(`manufacturerController.removeManyManufacturers -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    await removeManyManufacturers(body);
    winston.debug('manufacturerController.removeManyManufacturers -- success');
    return res.send();
};

module.exports = {
    addNewManufacturerController,
    getAllManufacturersController,
    modifyManufacturerController,
    removeManyManufacturersController,
};
