const express = require('express');

const {
    addNewsController,
    getAllNewsController,
    getNewsController,
    modifyNewsController,
    removeManyNewsController,
} = require('../../controller/newsController');
const { UserRole } = require('../../enums');
const role = require('../../middleware/roleMw');

const router = express.Router();

router.get('/', role(UserRole.CONTENT_MANAGER), getAllNewsController);
router.get('/:id', role(UserRole.CONTENT_MANAGER), getNewsController);

router.post('/', role(UserRole.CONTENT_MANAGER), addNewsController);
router.post('/delete', role(UserRole.CONTENT_MANAGER), removeManyNewsController);

router.put('/:id', role(UserRole.CONTENT_MANAGER), modifyNewsController);

module.exports = router;
