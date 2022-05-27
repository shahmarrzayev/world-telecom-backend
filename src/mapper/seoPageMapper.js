const {pick} = require('lodash')

const mapSaveSeoPageToEntity = saveDto => {
  if (!saveDto) return null;
  return pick(saveDto, [
      'title',
      'description',
      'meta_title',
      'meta_description',
      'tag',
  ]);
};

const mapSeoPageEntityToPublicDto = entity => {
  if (!entity) return null;
  const dto = pick(entity, [
    'title',
    'description',
    'meta_title',
    'meta_description',
    'tag',
    'products'
  ]);
  return dto;
};

module.exports = {
  mapSaveSeoPageToEntity,
  mapSeoPageEntityToPublicDto
}