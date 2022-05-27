const winston = require('winston');

const { validateAddUser, validateChangePassword } = require('./validator/userValidator');
const { BadRequestException } = require('../exceptions');
const { mapUserEntityToUserView } = require('../mapper/userMapper');
const { addUser, changePassword, getAllUsers, getUserById } = require('../service/userService');

const addUserController = async (req, res) => {
    winston.debug('userController.addUser -- start');
    const user = req.body;
    const error = validateAddUser(user);
    if (error) {
        winston.warn(`userController.addUser -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    const userEntity = await addUser(user);
    winston.debug('userController.addUser -- success');
    return res.send(mapUserEntityToUserView(userEntity));
};

const changePasswordController = async (req, res) => {
    winston.debug('userController.changePassword -- start');
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;
    const error = validateChangePassword(oldPassword, newPassword);
    if (error) {
        winston.warn(`userController.changePassword -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    const userEntity = await changePassword(id, oldPassword, newPassword);
    winston.debug('userController.changePassword -- success');
    return res.send(mapUserEntityToUserView(userEntity));
};

const getAllUsersController = async (req, res) => {
    winston.debug('userController.getAllUsers -- start');
    const userEntities = await getAllUsers();
    winston.debug('userController.getAllUsers -- success');
    return res.send(userEntities.map(mapUserEntityToUserView));
};

const getUserByIdController = async (req, res) => {
    winston.debug('userController.getUserById -- start');
    const userEntity = await getUserById(req.params.id);
    winston.debug('userController.getUserById -- success');
    return res.send(mapUserEntityToUserView(userEntity));
};

module.exports = {
    addUserController,
    changePasswordController,
    getAllUsersController,
    getUserByIdController,
};
