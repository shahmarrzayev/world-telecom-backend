jest.mock('winston');
jest.mock('../../mapper/newsMapper');
jest.mock('../../repository/newsRepository');

const { addNews, getAllNews, getNews, modifyNews, removeManyNews } = require('../newsService');
const { GeneralException, NotFoundException } = require('../../exceptions');
const { mapNewsViewToNewsEntity } = require('../../mapper/newsMapper');
const { deleteManyNews, findAllNews, findNewsById, saveNews, updateNews } = require('../../repository/newsRepository');

afterEach(() => {
    jest.clearAllMocks();
});

beforeEach(() => {
    deleteManyNews.mockReturnValue(Promise.resolve('deleted'));
    findAllNews.mockReturnValue(Promise.resolve(['news1', 'news2']));
    findNewsById.mockReturnValue(Promise.resolve('newsEntity'));
    mapNewsViewToNewsEntity.mockReturnValue('newsEntity');
    saveNews.mockReturnValue(Promise.resolve('savedNewsEntity'));
    updateNews.mockReturnValue(Promise.resolve('updatedNewsEntity'));
});

describe('newsService', () => {
    describe('addNews', () => {
        test('success', async () => {
            const result = await addNews('newsView');

            expect(result).toBe('savedNewsEntity');
            expect(mapNewsViewToNewsEntity).toHaveBeenCalledTimes(1);
            expect(saveNews).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when newsView param not defined', async () => {
            await expect(addNews()).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when cannot save news', async () => {
            saveNews.mockReturnValue(Promise.resolve(null));

            await expect(addNews('newsView')).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('getAllNews', () => {
        test('success', async () => {
            const result = await getAllNews();

            expect(result).toBeDefined();
            expect(result.length).toBe(2);
            expect(findAllNews).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when cannot get news', async () => {
            findAllNews.mockReturnValue(Promise.resolve(null));

            await expect(getAllNews()).rejects.toEqual(expect.any(GeneralException));
        });
    });

    describe('getNews', () => {
        test('success', async () => {
            const result = await getNews('id');

            expect(result).toBe('newsEntity');
            expect(findNewsById).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when id param is null', async () => {
            await expect(getNews()).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws not found exception when news not found', async () => {
            findNewsById.mockReturnValue(Promise.resolve(null));

            await expect(getNews('id')).rejects.toEqual(expect.any(NotFoundException));
        });
    });

    describe('modifyNews', () => {
        test('success', async () => {
            const result = await modifyNews('id', 'news');

            expect(result).toBe('updatedNewsEntity');
            expect(mapNewsViewToNewsEntity).toHaveBeenCalledTimes(1);
            expect(updateNews).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when id param is null', async () => {
            await expect(modifyNews(null, 'news')).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when news param is null', async () => {
            await expect(modifyNews('id', null)).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when cannot update news', async () => {
            updateNews.mockReturnValue(Promise.resolve(null));

            await expect(modifyNews('id', 'news')).rejects.toEqual(expect.any(NotFoundException));
        });
    });

    describe('removeManyNews', () => {
        test('success', async () => {
            await removeManyNews(['id1', 'id2']);

            expect(deleteManyNews).toHaveBeenCalledTimes(1);
        });

        test('throws general exception when ids param not defined', async () => {
            await expect(removeManyNews()).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when ids param is empty array', async () => {
            await expect(removeManyNews([])).rejects.toEqual(expect.any(GeneralException));
        });

        test('throws general exception when cannot delete news', async () => {
            deleteManyNews.mockReturnValue(Promise.resolve(null));

            await expect(removeManyNews(['id1', 'id2'])).rejects.toEqual(expect.any(GeneralException));
        });
    });
});
