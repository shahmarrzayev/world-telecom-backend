const winston = require('winston');

const { NotFoundException, GeneralException } = require('../exceptions');
const { mapNewsViewToNewsEntity } = require('../mapper/newsMapper');
const { deleteManyNews, findAllNews, findNewsById, saveNews, updateNews } = require('../repository/newsRepository');

/**
 * Add new news.
 * @param {NewsView} newsView
 * @returns {Promise<NewsEntity>}
 */
const addNews = async newsView => {
    winston.debug('newsService.addNews -- start');
    if (!newsView) {
        winston.warn('newsService.addNews -- null param');
        throw new GeneralException();
    }

    const newsEntity = mapNewsViewToNewsEntity(newsView);
    const savedNewsEntity = await saveNews(newsEntity);
    if (!savedNewsEntity) {
        winston.warn('newsService.addNews -- could not save news');
        throw new GeneralException();
    }
    winston.debug('newsService.addNews -- success');
    return savedNewsEntity;
};

/**
 * Get all news.
 * @returns {Promise<Array<NewsEntity>>}
 */
const getAllNews = async () => {
    winston.debug('newsService.getAllNews -- start');
    const allNews = await findAllNews();
    if (!allNews) {
        winston.warn('newsService.getAllNews -- could not get news');
        throw new GeneralException();
    }
    winston.debug('newsService.getAllNews -- success');
    return allNews;
};

/**
 * Find news by id.
 * @param {String} id
 * @returns {NewsEntity}
 */
const getNews = async id => {
    winston.debug('newsService.getNews -- start');
    if (!id) {
        winston.warn('newsService.getNews -- null param');
        throw new GeneralException();
    }

    const news = await findNewsById(id);
    if (!news) {
        winston.warn('newsService.getNews -- news not found');
        throw new NotFoundException('Xəbər tapılmadı');
    }
    winston.debug('newsService.getNews -- success');
    return news;
};

/**
 * Update news.
 * @param {String} id
 * @param {NewsView} newsView
 * @returns {Promise<NewsEntity>}
 */
const modifyNews = async (id, newsView) => {
    winston.debug('newsService.modifyNews -- start');
    if (!id || !newsView) {
        winston.warn(`newsService.modifyNews -- null param: ${id}, ${newsView}`);
        throw new GeneralException();
    }

    const newsEntity = mapNewsViewToNewsEntity(newsView);
    const updatedNewsEntity = await updateNews(id, newsEntity);
    if (!updatedNewsEntity) {
        winston.warn('newsService.modifyNews -- news not found');
        throw new NotFoundException('Xəbər tapılmadı');
    }
    winston.debug('newsService.modifyNews -- success');
    return updatedNewsEntity;
};

/**
 * Remove many news by ids.
 * @param {Array<String>} newsIds
 */
const removeManyNews = async ids => {
    winston.debug('newsService.removeManyNews -- start');
    if (!ids || !ids.length) {
        winston.warn('newsService.removeManyNews -- empty body');
        throw new GeneralException();
    }

    const newsDeleted = await deleteManyNews(ids);
    if (!newsDeleted) {
        winston.warn('newsService.removeManyNews -- could not remove news');
        throw new GeneralException();
    }
    winston.debug('newsService.removeManyNews -- success');
};

module.exports = {
    addNews,
    getAllNews,
    getNews,
    modifyNews,
    removeManyNews,
};
