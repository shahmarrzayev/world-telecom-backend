const SeoPage = require('./models/seoPageModel');
const winston = require('winston');
const { runQuery, getPaginationDetails } = require('./helper/repositoryHelper');
const { generateFilterAndQueryForProducts } = require('./helper/seoPageRepositoryHelper');
const Product = require('./models/productModel');

const findSeoPageByTag = async (tag, transaction) => {
  winston.debug('seoPageRepository.findSeoPageByTag -- start');
  if (!tag) return null;
  const seoPage = await runQuery(() => SeoPage.findOne({ tag }).session(transaction));
  return seoPage;
};

const saveSeoPage = async (seoPage, transaction) => {
  winston.debug('seoPageRepository.saveSeoPage -- start');
  
  if (!seoPage) {
    winston.warn('seoPageRepository.saveSeoPage -- null param');
    return null;
  };
  
  const dbSeoPage = new SeoPage(seoPage);
  const seoPageEntity = await runQuery(() => dbSeoPage.save({ session: transaction }));
  winston.debug('seoPageRepository.saveSeoPage -- success');
  return seoPageEntity;
}

const updateSeoPage = async (tag, seoPage, transaction) => {
  winston.debug('seoPageRepository.updateSeoPage -- start');
  if (!tag || !seoPage) {
      winston.warn(`seoPageRepository.updateSeoPage -- invalid args: ${tag}, ${seoPage}`);
      return null;
  }

  const savedNews = await runQuery(() =>
      SeoPage.findOneAndUpdate({tag}, seoPage, {
          new: true,
          session: transaction,
          useFindAndModify: false
      })
  );
  winston.debug('seoPageRepository.updateSeoPage -- success');
  return savedNews;
};

const removeSeoPage = async (tag, transaction) => {
  winston.debug('seoPageRepository.removeSeoPage -- start');
  if (!tag){
    winston.warn(`seoPageRepository.removeSeoPage -- invalid args ${tag}`);
    return null;
  }

  const deletedEntity = await runQuery(() => 
    SeoPage.findOneAndDelete({tag}, {
      session: transaction,
      useFindAndModify: false
    })
  )

  winston.debug('seoPageRepository.removeSeoPage -- success');
  return deletedEntity;
}


const findProducts = async (queryDetails, transaction) => {
  winston.debug('productRepository.findProducts -- start');
  const { limit, skip } = getPaginationDetails(queryDetails) || {};
  const { filter, query } = generateFilterAndQueryForProducts(queryDetails) || {};
  let sort = null;
  if (queryDetails && queryDetails.sort) {
      sort = queryDetails.sort === 'ASC' ? 1 : -1;
  }

  const products = await runQuery(() =>
      Product.aggregate([
          {
              $lookup: {
                  from: 'productoptions',
                  localField: 'options',
                  foreignField: '_id',
                  as: 'options',
              },
          },
          { $match: query },
          { $sort: sort ? { 'options.price': sort } : { createdAt: 1 } },
          { $limit: limit },
          { $skip: skip },
          {
              $addFields: {
                  options: {
                      $filter: filter,
                  },
              },
          },
      ]).session(transaction)
  );
  winston.debug('productRepository.findProducts -- success');
  return { query, filter, products };
};


const countProducts = async (query, filter, transaction) => {
  winston.debug('productRepository.countProducts -- start');
  const count = await runQuery(() =>
      Product.aggregate([
          {
              $lookup: {
                  from: 'productoptions',
                  localField: 'options',
                  foreignField: '_id',
                  as: 'options',
              },
          },
          { $match: query },
          {
              $addFields: {
                  options: {
                      $filter: filter,
                  },
              },
          },
          {
              $count: 'total',
          },
      ]).session(transaction)
  );
  winston.debug('productRepository.countProducts -- success');
  return count && count.length ? count[0].total : 0;
};

module.exports = {
  findSeoPageByTag,
  saveSeoPage,
  updateSeoPage,
  removeSeoPage,
  findProducts,
  countProducts
}