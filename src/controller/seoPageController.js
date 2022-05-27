const { validateCreateSeoPage, validateUpdateSeoPage } = require('./validator/seoPageValidator');
const { createSeoPage, getSeoPage, modifySeoPage, deleteSeoPage, getAllSeoPages } = require('../service/seoPageService');
const { mapSeoPageEntityToPublicDto } = require('../mapper/seoPageMapper');
const {BadRequestException} = require('../exceptions');
const winston = require('winston');
const { mapProductEntityToView } = require('../mapper/productMapper');

const getSeoPageController = async (req, res) => {
  winston.debug('seoPageController.getSeoPageController -- start');
  const seoPage = await getSeoPage(req.params.slug, req.query);
  seoPage.products = seoPage.products.map(p => mapProductEntityToView(p, true));
  winston.debug('seoPageController.getSeoPageController -- success');
  return res.send(seoPage);
}

const getAllSeoPagesController = async (req, res) => {
  winston.debug('seoPageController.getAllSeoPageController -- start');
  const seoPagesData = await getAllSeoPages();
  winston.debug('seoPageController.getAllSeoPageController -- success');
  return res.send(seoPagesData);
}

const createSeoPageController = async (req, res) => {
  const error = validateCreateSeoPage(req.body);
  if (error) throw new BadRequestException(error);
  const seoPage = await createSeoPage(req.body);
  return res.send(mapSeoPageEntityToPublicDto(seoPage));
}

const modifySeoPageController = async (req, res) => {
  const error = validateUpdateSeoPage(req.body);
  if (error) throw new BadRequestException(error);
  const seoPage = await modifySeoPage(req.body, req.params.slug);
  return res.send(mapSeoPageEntityToPublicDto(seoPage));
}

const deleteSeoPageController = async (req, res) => {
  const seoPage = await deleteSeoPage(req.params.slug);
  return res.send(mapSeoPageEntityToPublicDto(seoPage));
}

module.exports = {
  createSeoPageController,
  getSeoPageController,
  modifySeoPageController,
  deleteSeoPageController,
  getAllSeoPagesController
}