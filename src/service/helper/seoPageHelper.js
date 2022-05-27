const winston = require('winston');

const { ADMIN_DEFAULT_QUERY_LIMIT, MEMORY_PARAM } = require('../../constants');
const { getSubcategories } = require('./categoryHelper');
const { sortMemories } = require('../../utils/commonUtils');


const getSortAndFilterParamsFromRequestQuery = async query => {
  winston.debug('seoPageHelper.getSortAndFilterParamsFromRequestQuery -- start');
  if (!query) return null;

  const result = {};
  if (query.category && query.category !== 'all') {
    const subcategories = await getSubcategories(query.category);
    subcategories.push(query.category);
    result.categories = subcategories;
  }

  result.campaigns = query.campaigns ? query.campaigns.split(' ') : null;
  result.isPopular = query.isPopular === 'YES';
  result.newProduct = query.newProduct === 'YES';
  result.limit = query.limit ? parseInt(query.limit, 10) : ADMIN_DEFAULT_QUERY_LIMIT;
  result.manufacturers = query.manufacturer ? query.manufacturer.split(' ') : null;
  result.maxPrice = parseFloat(query.maxPrice);
  result.memories = query.memory ? query.memory.split('--') : null;
  result.minPrice = parseFloat(query.minPrice) || 0;
  result.model = query.model;
  result.page = query.page ? parseInt(query.page, 10) : 1;
  result.sort = query.sort;
  result.search = query.search;

  winston.debug('seoPageHelper.getSortAndFilterParamsFromRequestQuery -- success');
  return result;
};

const detectColors = (productOptions, memories) => {
  winston.debug('seoPageHelper.detectColors -- start');
  if (!productOptions || !productOptions.length) {
    return [];
  }

  const colors = [];
  if (!memories || !memories.length) {
    productOptions.forEach(o => {
      if (o.color) colors.push(o.color);
    });
    return colors;
  }

  productOptions.forEach(o => {
    if (o.memory === memories[0] && o && o.color) {
      colors.push(o.color);
    }
  });
  winston.debug('seoPageHelper.detectColors -- success');
  return colors;
};

/**
* Detects all memory options of a product.
* @param {Array<ProductOption>} productOptions
* @returns {Array<String>} memories
*/
const detectMemories = productOptions => {
  winston.debug('seoPageHelper.detectMemories -- start');
  if (!productOptions || !productOptions.length) return [];
  const memories = [];
  productOptions.forEach(o => {
    const memParam = o.parameters && o.parameters.length ? o.parameters.find(p => p.name === MEMORY_PARAM) : null;
    if (o.published && memParam && memParam.value && memories.indexOf(memParam.value) === -1) {
      memories.push(memParam.value);
    }
  });
  winston.debug('seoPageHelper.detectMemories -- success');
  return sortMemories(memories);
};
module.exports = {
  getSortAndFilterParamsFromRequestQuery,
  detectMemories,
  detectColors,
}