const { validateSaveDeviceInfo } = require('./validator/deviceInfoValidator');
const { BadRequestException } = require('../exceptions');
const { mapDeviceInfoEntityToPublicDto } = require('../mapper/deviceInfoMapper');
const { createOrUpdateDeviceInfo } = require('../service/deviceInfoService');

const createOrUpdateDeviceInfoController = async (req, res) => {
    const error = validateSaveDeviceInfo(req.body);
    if (error) throw new BadRequestException(error);
    const deviceInfo = await createOrUpdateDeviceInfo(req.body);
    return res.send(mapDeviceInfoEntityToPublicDto(deviceInfo));
};

module.exports = {
    createOrUpdateDeviceInfoController,
};
