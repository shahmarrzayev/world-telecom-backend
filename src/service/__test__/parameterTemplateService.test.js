jest.mock('winston');
jest.mock('../../mapper/parameterTemplateMapper');
jest.mock('../../repository/parameterTemplateRepository');

const {
    addNewTemplate,
    getAllTemplates,
    modifyTemplate,
    removeManyParameterTemplates,
} = require('../parameterTemplateService');
const { ConflictException, GeneralException, NotFoundException } = require('../../exceptions');
const { mapTemplateViewToTemplateEntity } = require('../../mapper/parameterTemplateMapper');
const {
    deleteManyTemplates,
    findAllTemplates,
    findTemplateByName,
    saveTemplate,
    updateTemplate,
} = require('../../repository/parameterTemplateRepository');

afterEach(() => {
    jest.clearAllMocks();
});

beforeEach(() => {
    deleteManyTemplates.mockReturnValue(Promise.resolve('deleted'));
    findAllTemplates.mockReturnValue(Promise.resolve(['t1', 't2']));
    findTemplateByName.mockReturnValue(Promise.resolve(null));
    mapTemplateViewToTemplateEntity.mockReturnValue('templateEntity');
    saveTemplate.mockReturnValue('savedTemplateEntity');
    updateTemplate.mockReturnValue(Promise.resolve('updatedTemplateEntity'));
});

describe('parameterTemplateService', () => {
    describe('addNewTemplate', () => {
        test('success', async () => {
            await addNewTemplate('templateView', 'userId');

            expect(findTemplateByName).toHaveBeenCalledTimes(1);
            expect(mapTemplateViewToTemplateEntity).toHaveBeenCalledTimes(1);
            expect(saveTemplate).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when templateView param not defined', async () => {
            await expect(addNewTemplate(null, 'userId')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when userId param not defined', async () => {
            await expect(addNewTemplate('view', null)).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when template with such name already exists', async () => {
            findTemplateByName.mockReturnValue(Promise.resolve('templateEntity'));

            await expect(addNewTemplate('view', 'userId')).rejects.toEqual(expect.any(ConflictException));
        });

        test('throws general exception when cannot save template', async () => {
            saveTemplate.mockReturnValue(Promise.resolve(null));

            await expect(addNewTemplate('view', 'userId')).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('getAllTemplates', () => {
        test('success', async () => {
            const result = await getAllTemplates();

            expect(result).toBeDefined();
            expect(result.length).toBe(2);
            expect(findAllTemplates).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when cannot get templates', async () => {
            findAllTemplates.mockReturnValue(Promise.resolve(null));

            await expect(getAllTemplates()).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('modifyTemplate', () => {
        test('success', async () => {
            const result = await modifyTemplate('id', 'view', 'userId');

            expect(result).toBe('updatedTemplateEntity');
            expect(mapTemplateViewToTemplateEntity).toHaveBeenCalledTimes(1);
            expect(updateTemplate).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when id param not defined', async () => {
            await expect(modifyTemplate(null, 'view', 'userId')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when templateView param not defined', async () => {
            await expect(modifyTemplate('id', null, 'userId')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when userId param not defined', async () => {
            await expect(modifyTemplate('id', 'view', null)).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when cannot update template', async () => {
            updateTemplate.mockReturnValue(Promise.resolve(null));

            await expect(modifyTemplate('id', 'view', 'userId')).rejects.toEqual(expect.any(NotFoundException));
        });
    });

    describe('removeManyParameterTemplates', () => {
        test('success', async () => {
            await removeManyParameterTemplates(['t1', 't2']);

            expect(deleteManyTemplates).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when ids param not defined', async () => {
            await expect(removeManyParameterTemplates()).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when ids param is empty array', async () => {
            await expect(removeManyParameterTemplates([])).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when cannot delete templates', async () => {
            deleteManyTemplates.mockReturnValue(Promise.resolve(null));

            await expect(removeManyParameterTemplates(['t1', 't2'])).rejects.toEqual(expect.any(GeneralException));
        });
    });
});
