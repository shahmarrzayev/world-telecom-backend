const winston = require('winston');

const { validateNews } = require('./validator/newsValidator');
const { validateArrayOfObjectIds } = require('./validator/commonValidator');
const { BadRequestException } = require('../exceptions');
const { mapNewsEntityToNewsView } = require('../mapper/newsMapper');
const { addNews, getAllNews, getNews, modifyNews, removeManyNews } = require('../service/newsService');

const addNewsController = async (req, res) => {
    winston.debug('newsController.addNews -- start');
    const { body } = req;
    const error = validateNews(body);
    if (error) {
        winston.warn(`newsController.addNews -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    const news = await addNews(body);
    winston.debug('newsController.addNews -- success');
    return res.send(mapNewsEntityToNewsView(news));
};

const getAllNewsController = async (req, res) => {
    winston.debug('newsController.getAllNews -- start');
    const allNews = await getAllNews();
    winston.debug('newsController.getAllNews -- success');
    return res.send(allNews.map(mapNewsEntityToNewsView));
};

const getNewsController = async (req, res) => {
    winston.debug('newsController.getNews -- start');
    const news = await getNews(req.params.id);
    winston.debug('newsController.getNews -- success');
    return res.send(mapNewsEntityToNewsView(news));
};

const modifyNewsController = async (req, res) => {
    winston.debug('newsController.modifyNews -- start');
    const { body, params } = req;
    const error = validateNews(body);
    if (error) {
        winston.warn(`newsController.modifyNews -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    const news = await modifyNews(params.id, body);
    winston.debug('newsController.modifyNews -- success');
    return res.send(mapNewsEntityToNewsView(news));
};

const removeManyNewsController = async (req, res) => {
    winston.debug('newsController.removeManyNews -- start');
    const { body } = req;
    const error = validateArrayOfObjectIds(body);
    if (error) {
        winston.warn(`newsController.removeManyNews -- ${JSON.stringify(error)}`);
        throw new BadRequestException(error);
    }
    await removeManyNews(body);
    winston.debug('newsController.removeManyNews -- success');
    return res.send();
};

module.exports = {
    addNewsController,
    getAllNewsController,
    getNewsController,
    modifyNewsController,
    removeManyNewsController,
};
