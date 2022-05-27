const { Types } = require("mongoose");
const winston = require("winston");
const { GeneralException, NotFoundException, ConflictException } = require("../exceptions");
const { mapSettingViewToSettingAdmin } = require("../mapper/settingMapper");
const { findSettingById, findSettingByVersions, findAllSettings, saveSetting, updateSetting, removeOneSetting } = require('../repository/settingRepository');
const { flushCache } = require("../utils/cacheUtils");

const getOneSetting = async (id) => {
  winston.debug('settingService.getOneSetting -- start');
  if (!id) {
    winston.error('settingService.getOneSetting -- null param id');
    throw new GeneralException();
  }

  const setting = await findSettingById(id);
  if (!setting) {
    winston.error('settingService.getOneSetting -- setting not found');
    throw new NotFoundException('Not Found');
  }

  flushCache();
  winston.debug('settingService.getOneSetting -- success');
  return setting;
}

const getAllSettings = async () => {
  winston.debug('settingService.getAllSettings -- start');
  const settings = await findAllSettings()
  if (!settings){
    winston.error('settingService.getOneSetting -- there are no settings');
    throw new NotFoundException('Not Found');
  }
  winston.debug('settingService.getAllSettings -- start');
  return settings;
}

const createSetting = async (body, userId) => {
  winston.debug('settingService.createSetting -- start');
  let setting = await findSettingByVersions(body.androidVersion, body.iosVersion);
  if (setting) {
    winston.warn('settingService.createSetting -- setting already exists');
    throw new ConflictException('Setting Already Exists');
  }

  setting = mapSettingViewToSettingAdmin(body);
  setting.createdBy = Types.ObjectId(userId);
  setting.createdAt = Date.now();

  let settingEntity = await saveSetting(setting);
  if (!settingEntity) {
    winston.error('settingService.createSetting -- could not save setting');
    throw new GeneralException();
  }

  flushCache();
  winston.debug('settingService.createSetting -- success');
  return settingEntity;
}

const modifySetting = async (body, id) => {
  winston.debug('settingService.modifySetting -- start');
  let entity = mapSettingViewToSettingAdmin(body);

  let setting = mapSettingViewToSettingAdmin(await findSettingById(id));

  Object.assign(setting, entity);

  const updatedSetting = await updateSetting(setting, id);
  if (!updatedSetting){
    winston.error('settingService.createSetting -- could not updated setting');
    throw new GeneralException();
  }

  winston.debug('settingService.modifySetting -- success');
  return updatedSetting;
}

const deleteOneSetting = async (id) => {
  winston.debug('settingService.deleteOneSetting -- start');
  if (!id){
    winston.error('settingService.deleteOneSetting -- null param id');
    throw new GeneralException();
  }

  const setting = await removeOneSetting(id);
  if(!setting){
    winston.error('settingService.createSetting -- setting not found');
    throw new GeneralException();
  }

  winston.debug('settingService.deleteOneSetting -- success');
  return setting;
}

module.exports = {
  getOneSetting,
  createSetting,
  getAllSettings,
  modifySetting,
  deleteOneSetting
}