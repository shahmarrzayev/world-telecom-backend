const { validateAddAddress } = require('./validator/customerValidator');
const { BadRequestException } = require('../exceptions');
const { mapCustomerEntityToPublicDto } = require('../mapper/customerMapper');
const { addAddress, deleteAddress, updateAddress } = require('../service/customerAddressService');

const addAddressController = async (req, res) => {
    const error = validateAddAddress(req.body);
    if (error) throw new BadRequestException(error);
    const customer = await addAddress(req.user, req.body);
    return res.send(mapCustomerEntityToPublicDto(customer));
};

const deleteAddressController = async (req, res) => {
    const customer = await deleteAddress(req.user, req.param.addressId);
    return res.send(mapCustomerEntityToPublicDto(customer));
};

const updateAddressController = async (req, res) => {
    const error = validateAddAddress(req.body);
    if (error) throw new BadRequestException(error);
    const customer = await updateAddress(req.user, req.body);
    return res.send(mapCustomerEntityToPublicDto(customer));
};

module.exports = {
    addAddressController,
    deleteAddressController,
    updateAddressController,
};
