const { runQuery } = require('./helper/repositoryHelper');
const DeviceInfo = require('./models/deviceInfoModel');

const findDeviceInfoByToken = async (token, transaction) => {
    if (!token) return null;
    const entity = await runQuery(() => DeviceInfo.findOne({ token }).session(transaction));
    return entity;
};

const saveDeviceInfo = async (deviceInfo, transaction) => {
    if (!deviceInfo) return null;
    const dbDeviceInfo = new DeviceInfo(deviceInfo);
    const deviceInfoEntity = await runQuery(() => dbDeviceInfo.save({ session: transaction }));
    return deviceInfoEntity;
};

const updateDeviceInfo = async (deviceInfo, transaction) => {
    if (!deviceInfo) return null;
    const entity = await runQuery(() =>
        DeviceInfo.findByIdAndUpdate(deviceInfo._id, deviceInfo, {
            new: true,
            session: transaction,
            useFindAndModify: false,
        })
    );
    return entity;
};

module.exports = {
    findDeviceInfoByToken,
    saveDeviceInfo,
    updateDeviceInfo,
};
