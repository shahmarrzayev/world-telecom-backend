jest.mock('winston');
jest.mock('../../mapper/parameterMapper');
jest.mock('../../repository/parameterRepository');
jest.mock('../../repository/parameterTemplateRepository');
jest.mock('../../repository/productOptionRepository');

const { addNewParameter, getAllParameters, modifyParameter, removeManyParameters } = require('../parameterService');
const { ConflictException, GeneralException, NotFoundException } = require('../../exceptions');
const { mapParameterViewToParameterEntity } = require('../../mapper/parameterMapper');
const {
    deleteManyParameters,
    findAllParameters,
    findParameterById,
    findParametersByIds,
    findParameterByName,
    saveParameter,
    updateParameter,
} = require('../../repository/parameterRepository');
const {
    deleteParametersFromTemplates,
    updateParameterInTemplates,
} = require('../../repository/parameterTemplateRepository');
const {
    deleteParamatersFromProductOptions,
    updateParameterInProductOption,
} = require('../../repository/productOptionRepository');

afterEach(() => {
    jest.clearAllMocks();
});

beforeEach(() => {
    deleteManyParameters.mockReturnValue(Promise.resolve('deleted'));
    deleteParamatersFromProductOptions.mockReturnValue(Promise.resolve('deleted'));
    deleteParametersFromTemplates.mockReturnValue(Promise.resolve('deleted'));
    findAllParameters.mockReturnValue(Promise.resolve(['param1', 'param2']));
    findParameterById.mockReturnValue(Promise.resolve({ name: 'name' }));
    findParametersByIds.mockReturnValue(Promise.resolve([{ name: 'param1' }, { name: 'param2' }]));
    findParameterByName.mockReturnValue(Promise.resolve(null));
    mapParameterViewToParameterEntity.mockReturnValue('parameterEntity');
    saveParameter.mockReturnValue(Promise.resolve('savedParameterEntity'));
    updateParameter.mockReturnValue(Promise.resolve('updatedParameterEntity'));
    updateParameterInTemplates.mockReturnValue(Promise.resolve('updated'));
    updateParameterInProductOption.mockReturnValue(Promise.resolve('updated'));
});

describe('parameterService', () => {
    describe('addNewParameter', () => {
        test('success', async () => {
            const result = await addNewParameter('parameterView', 'userId');

            expect(result).toBe('savedParameterEntity');
            expect(findParameterByName).toHaveBeenCalledTimes(1);
            expect(mapParameterViewToParameterEntity).toHaveBeenCalledTimes(1);
            expect(saveParameter).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when parameterView param not defined', async () => {
            await expect(addNewParameter(null, 'userId')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when parameterView param not defined', async () => {
            await expect(addNewParameter('parameterView', null)).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws conflict exception when parameter with such name already exists', async () => {
            findParameterByName.mockReturnValue(Promise.resolve('parameterEntity'));

            await expect(addNewParameter('parameterView', 'userId')).rejects.toEqual(expect.any(ConflictException));
        });

        test('throws general exception when cannot save parameter', async () => {
            saveParameter.mockReturnValue(Promise.resolve(null));

            await expect(addNewParameter('parameterView', 'userId')).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('getAllParameters', () => {
        test('success', async () => {
            const result = await getAllParameters();

            expect(result).toBeDefined();
            expect(result.length).toBe(2);
        });

        test('throws general exception when cannot get parameters', async () => {
            findAllParameters.mockReturnValue(Promise.resolve(null));

            await expect(getAllParameters()).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('modifyParameter', () => {
        test('success', async () => {
            const result = await modifyParameter('id', 'parameterView', 'userId');

            expect(result).toBe('updatedParameterEntity');
            expect(findParameterById).toHaveBeenCalledTimes(1);
            expect(mapParameterViewToParameterEntity).toHaveBeenCalledTimes(1);
            expect(updateParameter).toHaveBeenCalledTimes(1);
            expect(updateParameterInTemplates).toHaveBeenCalledTimes(1);
            expect(updateParameterInProductOption).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when id param not defined', async () => {
            await expect(modifyParameter(null, 'view', 'userId')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when id param not defined', async () => {
            await expect(modifyParameter(null, null, 'userId')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when id param not defined', async () => {
            await expect(modifyParameter('id', 'view', null)).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws conflict exception when tries to update memory param', async () => {
            await expect(modifyParameter('5e7c751a737da00007503ed6', 'view', 'userId')).rejects.toEqual(
                expect.any(ConflictException)
            );
        });

        test('throws not found exception when cannot find param', async () => {
            findParameterById.mockReturnValue(Promise.resolve(null));

            await expect(modifyParameter('id', 'view', 'userId')).rejects.toEqual(expect.any(NotFoundException));
        });

        test('throws not found exception when cannot update param', async () => {
            updateParameter.mockReturnValue(Promise.resolve(null));

            await expect(modifyParameter('id', 'view', 'userId')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws not found exception when cannot update param in templates', async () => {
            updateParameterInTemplates.mockReturnValue(Promise.resolve(null));

            await expect(modifyParameter('id', 'view', 'userId')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws not found exception when cannot update param in options', async () => {
            updateParameterInProductOption.mockReturnValue(Promise.resolve(null));

            await expect(modifyParameter('id', 'view', 'userId')).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('removeManyParameters', () => {
        test('success', async () => {
            await removeManyParameters(['param1', 'param2']);

            expect(findParametersByIds).toHaveBeenCalledTimes(1);
            expect(deleteManyParameters).toHaveBeenCalledTimes(1);
            expect(deleteParametersFromTemplates).toHaveBeenCalledTimes(1);
            expect(deleteParamatersFromProductOptions).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when ids param not defined', async () => {
            await expect(removeManyParameters()).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when one or more of ids not found', async () => {
            await expect(removeManyParameters(['param1'])).rejects.toEqual(expect.any(NotFoundException));
        });

        test('throws general exception when cannot delete params', async () => {
            deleteManyParameters.mockReturnValue(null);

            await expect(removeManyParameters(['param1', 'param2'])).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when cannot delete params from templates', async () => {
            deleteParametersFromTemplates.mockReturnValue(null);

            await expect(removeManyParameters(['param1', 'param2'])).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when cannot delete params from options', async () => {
            deleteParamatersFromProductOptions.mockReturnValue(null);

            await expect(removeManyParameters(['param1', 'param2'])).rejects.toEqual(expect.any(GeneralException));
        });
    });
});
