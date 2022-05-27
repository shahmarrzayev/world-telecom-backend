const winston = require('winston');

const { GeneralException } = require('../exceptions');
const { mapSaveDeviceInfoDtoToEntity } = require('../mapper/deviceInfoMapper');
const { findDeviceInfoByToken, saveDeviceInfo, updateDeviceInfo } = require('../repository/deviceInfoRepository');

const createOrUpdateDeviceInfo = async deviceInfo => {
    winston.debug('deviceInfoService.createOrUpdateDeviceInfo -- start');
    if (!deviceInfo) {
        winston.warn('deviceInfoService.createOrUpdateDeviceInfo -- invalid args');
        throw new GeneralException();
    }

    const info = await findDeviceInfoByToken(deviceInfo.token);

    let deviceInfoEntity = mapSaveDeviceInfoDtoToEntity(deviceInfo);
    if (info) {
        deviceInfoEntity._id = info._id;
        deviceInfoEntity = await updateDeviceInfo(deviceInfoEntity);
    } else {
        deviceInfoEntity = await saveDeviceInfo(deviceInfoEntity);
    }
    winston.debug('deviceInfoService.createOrUpdateDeviceInfo -- success');
    return deviceInfoEntity;
};

module.exports = {
    createOrUpdateDeviceInfo,
};
