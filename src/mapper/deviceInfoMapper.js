const { pick } = require('lodash');

const mapDeviceInfoEntityToPublicDto = entity => {
    if (!entity) return null;
    return pick(entity, ['_id', 'token', 'model', 'browserId']);
};

const mapSaveDeviceInfoDtoToEntity = dto => {
    if (!dto) return null;
    return pick(dto, ['token', 'model', 'customerId', 'browserId']);
};

module.exports = {
    mapDeviceInfoEntityToPublicDto,
    mapSaveDeviceInfoDtoToEntity,
};
