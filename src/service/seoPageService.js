const winston = require('winston');
const hash = require('object-hash');

// Conflict Exception
const { ConflictException } = require('../exceptions');
const { findSeoPageByTag, saveSeoPage, updateSeoPage, removeSeoPage } = require('./../repository/seoPageRepository');
const { mapSaveSeoPageToEntity } = require('./../mapper/seoPageMapper');
const SeoPage = require('../repository/models/seoPageModel');
const { runQuery } = require('../repository/helper/repositoryHelper');
const { GeneralException } = require('../exceptions');


const { getSortAndFilterParamsFromRequestQuery, detectColors, detectMemories } = require('../service/helper/seoPageHelper');
const { findProducts, countProducts } = require('../repository/seoPageRepository');
const { getFromCache } = require('../utils/cacheUtils');

const getSeoPage = async (tag, requestQuery, transaction) => {
  winston.debug('seoPageService.getSeoPage -- start');

  if (!tag) {
    winston.warn('seoPageService.getSeoPage -- invalid arg');
    throw new GeneralException();
  }
  
  const seoPage = await runQuery(() => SeoPage.findOne({ tag }).session(transaction));
  if (!seoPage){
    winston.warn('seoPageService.getSeoPage -- seo page not found');
    throw new GeneralException('Seo page not found');
  }

  // requestQuery.tags = requestQuery.tags && requestQuery.tags.length ? requestQuery.tags.split(',') : seoPage.tags; 


  const filterOptions = await getSortAndFilterParamsFromRequestQuery(requestQuery);
  if (!filterOptions) {
    winston.warn('seoPageService.getSeoPage -- could not get filter options');
    throw new GeneralException();
  }

  const queryHash = hash(filterOptions);
  let result = getFromCache(queryHash);
  if (result) return result;

  // filterOptions.published = user ? null : true;
  filterOptions.published = true;
  const { query, filter, products } = (await findProducts(filterOptions)) || {};
  if (!products) {
    winston.warn('seoPageService.getSeoPage -- could not get products');
    throw new GeneralException();
  }

  if (products.length) {
    products.forEach(p => {
      p.availableColors = detectColors(p.options, p.memoryOptions);
      p.memoryOptions = detectMemories(p.options);
    });
  }

  const totalNumberOfProducts = await countProducts(query, filter);


  result = {
    limit: filterOptions.limit,
    page: filterOptions.page,
    title: seoPage.title,
    description: seoPage.description,
    meta_title: seoPage.meta_title,
    meta_description: seoPage.meta_description,
    tag: seoPage.tag,
    countProduct: totalNumberOfProducts,
    products,
  };

  winston.debug('seoPageService.getSeoPage -- success');
  return result;
}

const getAllSeoPages = async () => {
  winston.debug('seoPageService.getAllSeoPages -- start');
  const data = await runQuery(() => SeoPage.find());
  winston.debug('seoPageService.getAllSeoPages -- success');
  return data;
}

const createSeoPage = async seoPage => {
  winston.debug('seoPageService.createSeoPage -- start');
  if (!seoPage) {
    winston.warn('seoPageService.createSeoPage -- invalid arg');
    throw new GeneralException();
  }

  const seoPageExists = await findSeoPageByTag(seoPage.tag);
  if (seoPageExists) {
    winston.debug('seoPageService.createSeoPage -- seo-page exists');
    throw new ConflictException('Seo mövcüddur');
  }

  let entity = mapSaveSeoPageToEntity(seoPage);
  
  entity = await saveSeoPage(entity);

  if (!entity) {
    winston.warn('seoPageService.createSeoPage -- could not save');
    throw new GeneralException();
  }
  winston.debug('seoPageService.createSeoPage -- success');
  return entity;
}

const modifySeoPage = async (seoPage, tag) => {
  winston.debug('seoPageService.modifySeoPage -- start');

  const entity = await updateSeoPage(tag, seoPage);
  if (!entity) {
    winston.warn('seoPageService.modifySeoPage -- could not update');
    throw new GeneralException();
  }
  winston.debug('seoPageService.modifySeoPage -- success');
  return entity;
}

const deleteSeoPage = async tag => {
  winston.debug('seoPageService.deleteSeoPage -- start');
  if (!tag) {
    winston.warn('seoPageService.deleteSeoPage -- invalid args');
    throw new GeneralException();
  }

  const entity = await removeSeoPage(tag);

  if (!entity) {
    winston.warn('seoPageService.deleteSeoPage -- could not deleted');
    throw new GeneralException();
  }

  winston.debug('seoPageService.deleteSeoPage -- sucess');
  return entity;
}


module.exports = {
  createSeoPage,
  getSeoPage,
  modifySeoPage,
  deleteSeoPage,
  getAllSeoPages
}