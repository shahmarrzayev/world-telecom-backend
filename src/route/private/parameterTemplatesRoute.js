const express = require('express');

const {
    addNewTemplateController,
    getAllTemplatesController,
    modifyTemplateController,
    removeManyParameterTemplatesController,
} = require('../../controller/parameterTemplateController');
const { UserRole } = require('../../enums');
const role = require('../../middleware/roleMw');

const router = express.Router();

router.get('/', role(UserRole.CONTENT_MANAGER), getAllTemplatesController);

router.post('/', role(UserRole.CONTENT_MANAGER), addNewTemplateController);
router.post('/delete', role(UserRole.CONTENT_MANAGER), removeManyParameterTemplatesController);

router.put('/:id', role(UserRole.CONTENT_MANAGER), modifyTemplateController);

module.exports = router;
