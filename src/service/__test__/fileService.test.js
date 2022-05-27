jest.mock('winston');
jest.mock('../helper/fileHelper');
jest.mock('../../client/storageClient');
jest.mock('../../service/numberService');

const { parseNumberExcelFile } = require('../helper/fileHelper');
const { processNumbersFile, uploadFileToStorage } = require('../fileService');
const { uploadFileToSpaces } = require('../../client/storageClient');
const { GeneralException } = require('../../exceptions');
const { addManyNumbers } = require('../../service/numberService');

afterEach(() => {
    jest.clearAllMocks();
});

beforeEach(() => {
    addManyNumbers.mockReturnValue(Promise.resolve('added'));
    parseNumberExcelFile.mockReturnValue();
    uploadFileToSpaces.mockReturnValue(Promise.resolve('url'));
});

describe('fileService', () => {
    describe('processNumbersFile', () => {
        test('success', async () => {
            await processNumbersFile('file', 'userId');

            expect(parseNumberExcelFile).toHaveBeenCalledTimes(1);
            expect(addManyNumbers).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when file param is not defined', async () => {
            await expect(processNumbersFile(null, 'userId')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when userId param is not defined', async () => {
            await expect(processNumbersFile('file', null)).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('uploadFileToStorage', () => {
        test('success', async () => {
            const result = await uploadFileToStorage({ originalname: 'filename' });

            expect(result).toBeDefined();
            expect(result.url).toBe('url');
            expect(uploadFileToSpaces).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when file param is not defined', async () => {
            await expect(uploadFileToStorage()).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when uploadFile returns null', async () => {
            uploadFileToSpaces.mockReturnValue(Promise.resolve(null));

            await expect(uploadFileToStorage('file')).rejects.toEqual(expect.any(GeneralException));
        });
    });
});
