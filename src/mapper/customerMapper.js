const { isArray, pick } = require('lodash');

const mapAddressEntityToPublicDto = entity => {
    if (!entity) return null;
    return pick(entity, ['_id', 'street', 'houseNumber', 'district', 'city']);
};

const mapCustomerEntityToPublicDto = entity => {
    if (!entity) return null;
    const dto = pick(entity, [
        '_id',
        'firstName',
        'lastName',
        'email',
        'mobilePhone',
        'gender',
        'idType',
        'birthDate',
        'serialNumber',
        'finCode',
        'favoriteCart'
    ]);
    dto.addresses = isArray(entity.addresses) ? entity.addresses.map(mapAddressEntityToPublicDto) : [];
    return dto;
};

const mapSaveCustomerToEntity = saveDto => {
    if (!saveDto) return null;
    return pick(saveDto, [
        'firstName',
        'lastName',
        'email',
        'mobilePhone',
        'gender',
        'idType',
        'serialNumber',
        'finCode',
    ]);
};

module.exports = {
    mapCustomerEntityToPublicDto,
    mapSaveCustomerToEntity,
};
