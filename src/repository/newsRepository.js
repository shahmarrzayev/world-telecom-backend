const winston = require('winston');

const { runQuery } = require('./helper/repositoryHelper');
const News = require('./models/newsModel');

const deleteManyNews = async (ids, transaction) => {
    winston.debug('newsRepository.deleteManyNews -- start');
    if (!ids || !ids.length) {
        winston.warn('newsRepository.deleteManyNews -- null or empty param');
        return null;
    }
    const queryResult = await runQuery(() => News.deleteMany({ _id: { $in: ids } }, { session: transaction }));
    winston.debug('newsRepository.deleteManyNews -- success');
    return queryResult;
};

const findAllNews = async transaction => {
    winston.debug('newsRepository.findAllNews -- start');
    const news = await runQuery(() => News.find({}).session(transaction));
    winston.debug('newsRepository.findAllNews -- success');
    return news;
};

const findNewsById = async (id, transaction) => {
    winston.debug('newsRepository.findNewsById -- start');
    if (!id) {
        winston.warn('newsRepository.findNewsById -- null param');
        return null;
    }
    const news = await runQuery(() => News.findById(id).session(transaction));
    winston.debug('newsRepository.findNewsById -- success');
    return news;
};

const saveNews = async (news, transaction) => {
    winston.debug('newsRepository.saveNews -- start');
    if (!news) {
        winston.warn('newsRepository.saveNews -- null param');
        return null;
    }
    const dbNews = new News(news);
    const newsEntity = await runQuery(() => dbNews.save({ session: transaction }));
    winston.debug('newsRepository.saveNews -- success');
    return newsEntity;
};

const updateNews = async (id, news, transaction) => {
    winston.debug('newsRepository.updateNews -- start');
    if (!id || !news) {
        winston.warn(`newsRepository.updateNews -- null param: ${id}, ${news}`);
        return null;
    }
    const savedNews = await runQuery(() =>
        News.findByIdAndUpdate(id, news, {
            new: true,
            session: transaction,
            useFindAndModify: false,
        })
    );
    winston.debug('newsRepository.updateNews -- success');
    return savedNews;
};

module.exports = {
    deleteManyNews,
    findAllNews,
    findNewsById,
    saveNews,
    updateNews,
};
