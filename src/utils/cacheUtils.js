const LruCache = require('lru-cache');

let cache;

const getFromCache = key => {
    if (!cache || !key) return null;
    return cache.get(key);
};

const flushCache = () => {
    if (!cache) return;
    cache.reset();
};

const initCache = () => {
    if (!cache) {
        try {
            cache = new LruCache({
                max: 5000,
                max_age: 1000 * 60 * 60 * 24, // 24 hours
            });
        } catch (error) {
            throw new Error(error);
        }
    }
};

const setInCache = (key, value) => {
    if (!cache || !key) return;
    cache.set(key, value);
};

module.exports = {
    getFromCache,
    flushCache,
    initCache,
    setInCache,
};
