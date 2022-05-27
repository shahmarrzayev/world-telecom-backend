const winston = require("winston");
const { mapFilterEntityToView, mapFilterEntityToAdminView } = require("../mapper/filterMapper");

const { addNewFilters, getFilters, activateFilters, deactivateFilters } = require('../service/filterService');

const addNewFiltersController = async (req, res) => {
    winston.debug('filterController.addNewFiltersController -- start');
    const filters = await addNewFilters(req.body);
    winston.debug('filterController.addNewFiltersController -- success');
    res.send(filters.map(filtersEntity => mapFilterEntityToAdminView(filtersEntity)));
}

const getFiltersController = async (req, res) => {
    winston.debug('filterController.getFiltersController -- start');
    const filters = await getFilters(req.params.slug);
    winston.debug('filterController.getFiltersController -- success');
    res.send(filters.map(filtersEntity => mapFilterEntityToView(filtersEntity)));
}

const activateFiltersController = async (req, res) => {
    winston.debug('filterController.avtivateFiltersController -- start');
    const filters = await activateFilters(req.body, req.transaction);
    winston.debug('filterController.avtivateFiltersController -- success');
    res.send(filters.map(filtersEntity => mapFilterEntityToAdminView(filtersEntity)));
}

const deactivateFiltersController = async (req, res) => {
    winston.debug('filterController.deavtivateFiltersController -- start');
    const filters = await deactivateFilters(req.body, req.transaction);
    winston.debug('filterController.deavtivateFiltersController -- success');
    res.send(filters.map(filtersEntity => mapFilterEntityToAdminView(filtersEntity)));
}

module.exports = {
    addNewFiltersController,
    getFiltersController,
    activateFiltersController,
    deactivateFiltersController
} 