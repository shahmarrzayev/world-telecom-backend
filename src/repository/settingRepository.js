const winston = require("winston");
const { GeneralException } = require("../exceptions");
const { runQuery } = require('./helper/repositoryHelper');
const Setting = require('./models/settingModel');

const findSettingById = async (id, transaction) => {
  winston.debug('settingRepository.findSettingById -- start');
  const setting = await runQuery(() => Setting.findById(id).session(transaction));

  winston.debug('settingRepository.findSettingById -- success');
  return setting;
}

const findAllSettings = async (transaction) => {
  winston.debug('settingRepository.findAllSettings -- start');
  const settings = await runQuery(() => Setting.find({}).session(transaction));
  winston.debug('settingRepository.findAllSettings -- success');
  return settings;
}

const findSettingByVersions = async (androidVersion, iosVersion, transaction) => {
  winston.debug('settingRepository.findSettingByVersions -- start');

  if (!androidVersion || !iosVersion) {
    winston.error(`settingRepository.findSettingByVersions -- null param ${androidVersion} ${iosVersion}`);
    throw new GeneralException();
  }

  const entity = await runQuery(() => Setting.findOne({ iosVersion, androidVersion }).session(transaction));

  winston.debug('settingRepository.findSettingByVersions -- success');
  return entity;
}

const saveSetting = async (entity, transaction) => {
  winston.debug('settingRepository.saveSetting -- start');
  if (!entity) {
    winston.error(`settinRepository.saveSetting -- null param ${entity}`);
    throw new GeneralException();
  }
  const dbSetting = new Setting(entity);
  const savedSetting = await runQuery(() => dbSetting.save({ session: transaction }))
  winston.debug('settingRepository.saveSetting -- success');
  return savedSetting;
}

const updateSetting = async (entity, _id, transaction) => {
  console.log('entity -- ', entity);
  console.log('id -- ', _id)
  winston.debug('settingRepository.updateSetting -- start');
  if (!entity) {
    winston.error(`settinRepository.updateSetting -- null param ${entity}`);
    throw new GeneralException();
  }
  const updatedSetting = await runQuery(() =>
    Setting.findOneAndUpdate({ _id }, entity, {
      new: true,
      session: transaction,
      useFindAndModify: false,
    })
  );

  winston.debug('settingRepository.updateSetting -- success');
  return updatedSetting;
}

const removeOneSetting = async (_id, transaction) => {
  winston.debug('settingRepository.removeSetting -- start');
  const entity = await runQuery(() => Setting.findOneAndDelete({ _id }).session(transaction));

  winston.debug('settingRepository.removeSetting -- success');
  return entity;
}

module.exports = {
  findSettingById,
  findSettingByVersions,
  findAllSettings,
  saveSetting,
  updateSetting,
  removeOneSetting
}