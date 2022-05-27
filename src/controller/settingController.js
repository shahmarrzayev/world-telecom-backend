const winston = require('winston');

const {
  getOneSetting,
  createSetting,
  getAllSettings,
  modifySetting,
  deleteOneSetting
} = require('../service/settingService');

const { mapSettingEntityToAdminView, mapSettingViewToSettingAdmin } = require('../mapper/settingMapper');

const {
  validateSetting, validateSettingUpdate
} = require('../controller/validator/settingValidator.js');
const { BadRequestException } = require('../exceptions');

const getOneSettingController = async (req, res) => {
  winston.debug('settingController.getOneSetting -- start');
  const setting = await getOneSetting(req.params.id);

  winston.debug('settingController.getOneSetting -- success')
  return res.send(mapSettingEntityToAdminView(setting));
}

const getAllSettingsController = async (req, res) => {
  winston.debug('settingController.getAllSettings -- start');
  const settings = await getAllSettings();

  winston.debug('settingController.getAllSettings -- success');
  return res.send(settings.map(setting => mapSettingEntityToAdminView(setting)));
};

const createSettingController = async (req, res) => {
  winston.debug('settingController.createSetting -- start')
  const { body, user } = req;

  const error = validateSetting(body);
  if (error) {
    winston.warn(`settingController.createSetting -- ${JSON.stringify(error)}`);
    throw new BadRequestException(error);
  }

  let setting = mapSettingViewToSettingAdmin(body);

  setting = await createSetting(body, user._id);
  winston.debug('settingController.createSetting -- success');
  return res.send(mapSettingEntityToAdminView(setting));
};

const modifySettingController = async (req, res) => {
  winston.debug('settingController.modifySetting -- start');

  const { body } = req;

  const error = validateSettingUpdate(body);
  if (error) {
    winston.warn(`settingController.createSetting -- ${JSON.stringify(error)}`);
    throw new BadRequestException(error);
  }

  let setting = mapSettingViewToSettingAdmin(body);

  setting = await modifySetting(body, req.params.id);

  winston.debug('settingController.modifySetting -- success');
  return res.send(mapSettingEntityToAdminView(setting));
};

const deleteOneSettingController = async (req, res) => {
  winston.debug('settingController.deleteOneSetting -- start');
  const setting = await deleteOneSetting(req.params.id);

  winston.debug('settingController.deleteOneSetting -- success');
  return res.send(mapSettingEntityToAdminView(setting));
};

module.exports = {
  getOneSettingController,
  getAllSettingsController,
  createSettingController,
  modifySettingController,
  deleteOneSettingController
}