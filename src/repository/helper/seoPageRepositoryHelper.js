const mongoose = require("mongoose");
const winston = require("winston");
const { sanitizeStringForRegEx } = require("../../utils/commonUtils");


const generateFilterAndQueryForProducts = ({
  campaigns,
  categories,
  isPopular,
  newProduct,
  manufacturers,
  maxPrice,
  memories,
  minPrice,
  model,
  search,
  published,
//   tags
} = {}) => {
  winston.debug('productRepositoryHelper.generateFilterAndQueryForProducts -- start');
  let filter = { input: '$options', cond: { $and: [] } };
  let query = { $and: [] };

  if (campaigns && campaigns.length) {
      const campaignObjectIds = campaigns.map(c => mongoose.Types.ObjectId(c));
      // filter.cond.$and.push({ $in: ['$$this.campaigns', [campaignObjectIds]] });
      query.$and.push({ 'options.campaigns': { $in: campaignObjectIds } });
  }

  if (manufacturers) {
      query.$and.push({ manufacturer: { $in: manufacturers } });
  }
  if (memories) {
      filter.cond.$and.push({ $in: ['$$this.memory', memories] });
      query.$and.push({ 'options.memory': { $in: memories } });
  }
  if (model) {
      query.$and.push({
          model: { $regex: new RegExp(`^.*${sanitizeStringForRegEx(model)}.*$`, 'i') },
      });
  }
  if (categories && categories.length) {
      query.$and.push({ categories: { $elemMatch: { $in: categories } } });
  }
  if (isPopular) {
      query.$and.push({ isPopular });
  }
  if (newProduct) {
      query.$and.push({ newProduct });
  }
  if (minPrice) {
      filter.cond.$and.push({ $gte: ['$$this.price', minPrice] });
      query.$and.push({ 'options.price': { $gte: minPrice } });
  }
  if (maxPrice) {
      filter.cond.$and.push({ $lte: ['$$this.price', maxPrice] });
      query.$and.push({ 'options.price': { $lte: maxPrice } });
  }

//   if (tags){
//       query.$and.push({ tags: {$elemMatch : {$in : tags}} });
//   }

  if (search) {
      const orArray = [
          { tags: { $regex: new RegExp(`^.*${sanitizeStringForRegEx(search)}.*$`, 'i') } },
          { 'options.fullName': { $regex: new RegExp(`^.*${sanitizeStringForRegEx(search)}.*$`, 'i') } },
          { model: search },
          { model: { $regex: new RegExp(`^.*${sanitizeStringForRegEx(search)}.*$`, 'i') } },
          { manufacturer: { $regex: new RegExp(`^.*${sanitizeStringForRegEx(search)}.*$`, 'i') } },
          { 'options.identificator': { $regex: new RegExp(`^.*${sanitizeStringForRegEx(search)}.*$`, 'i') } },
          { categories: { $regex: new RegExp(`^.*${sanitizeStringForRegEx(search)}.*$`, 'i') } },
      ];
      const separateWords = search.split(' ');
      if (separateWords && separateWords.length) {
          if (separateWords.length === 2) {
              orArray.push({
                  $and: [
                      {
                          manufacturer: {
                              $regex: new RegExp(`^.*${sanitizeStringForRegEx(separateWords[0])}.*$`, 'i'),
                          },
                      },
                      { model: { $regex: new RegExp(`^.*${sanitizeStringForRegEx(separateWords[1])}.*$`, 'i') } },
                  ],
              });
          } else if (separateWords.length >= 3) {
              let identificator = '';
              // eslint-disable-next-line no-plusplus
              for (let i = 0; i < separateWords.identificator; i++) {
                  identificator += `${separateWords[i]} `;
              }
              orArray.push({
                  $and: [
                      {
                          manufacturer: {
                              $regex: new RegExp(`^.*${sanitizeStringForRegEx(separateWords[0])}.*$`, 'i'),
                          },
                      },
                      { model: { $regex: new RegExp(`^.*${sanitizeStringForRegEx(separateWords[1])}.*$`, 'i') } },
                      {
                          identificator: {
                              $regex: new RegExp(`^.*${sanitizeStringForRegEx(identificator)}.*$`, 'i'),
                          },
                      },
                  ],
              });
          } else {
              separateWords.forEach(w => {
                  orArray.push({ model: { $regex: new RegExp(`^.*${sanitizeStringForRegEx(w)}.*$`, 'i') } });
              });
          }
      }
      query.$and.push({ $or: orArray });
  }
  if (published) {
      filter.cond.$and.push({ $eq: ['$$this.published', true] });
      query.$and.push({ 'options.published': true });
  }

  filter = filter.cond.$and ? filter : {};
  query = query.$and.length ? query : {};

  winston.debug('productRepositoryHelper.generateFilterAndQueryForProducts -- success');
  return { filter, query };
};

module.exports = {
  generateFilterAndQueryForProducts
}