const { pick } = require('lodash')

const mapSettingViewToSettingAdmin = (entity) => {
  if (!entity) return null;
  return pick(entity, [
    'androidVersion',
    'iosVersion',
    'changelog',
    'require'
  ])
}

const mapSettingEntityToAdminView = (entity) => {
  if (!entity) return null;
  return pick(entity, [
    '_id',
    'androidVersion',
    'iosVersion',
    'changelog',
    'require',
    'createdBy',
    'createdAt'
  ])
}


module.exports = {
  mapSettingViewToSettingAdmin,
  mapSettingEntityToAdminView
}