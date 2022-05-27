const moment = require('moment');
const uniqueRandom = require('unique-random');
const xml2js = require('xml2js');

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Converts given xml string to JS object.
 * @param {String} xml
 * @returns {Promise<Object>}
 */
const convertXmlToObj = async xml => {
    return new Promise(resolve => {
        xml2js.parseString(xml, (err, result) => {
            if (err) resolve(null);
            resolve(result);
        });
    });
};

/**
 * Generates a random number in the given range (default is 1-10 million).
 * @param {Number} min
 * @param {Number} max
 * @returns {Number}
 */
const createRandomNumber = (min, max) => uniqueRandom(min || 1000000000, max || 100000000000)();

/**
 * Creates a string consisting of random chars and numbers.
 * @param {Number} length
 * @returns {String}
 */
const createRandomString = length => {
    const result = [];
    const charactersLength = CHARACTERS.length;
    for (let i = 0; i < length; i++) {
        result.push(CHARACTERS.charAt(Math.floor(Math.random() * charactersLength)));
    }
    return result.join('');
};

/**
 * Sleep for {ms} seconds.
 * @param {Number} ms
 * @returns {Promise}
 */
const delay = ms => new Promise(res => setTimeout(res, ms));

/**
 * Returns current timestamp in given format (which is optional).
 * @param {String} format
 * @returns {String}
 */
const getCurrentTimestamp = format => moment().format(format || 'YYYY-MM-DD HH:MM:SS');

/**
 * Safely gets environment variable.
 * @param {String} value
 * @returns {String} value of the environment variable
 */
const getFromEnv = value => (value ? process.env[value] : null);

/**
 * Checks if the given object is a valid date.
 * @param {String} date
 * @returns {Boolean}
 */
const isValidDate = date => moment(date).isValid();

/**
 * Escapes invalid characters from string for regular expression.
 * @param {String} str
 * @returns {String}
 */
const sanitizeStringForRegEx = str => (str ? str.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1') : null);

/**
 * Sorts strings of memories ('128 GB') by their number.
 * @param {Array<String>} memories
 * @returns {Array<String>} sorted memories
 */
const sortMemories = memories => {
    if (!memories || !memories.length) {
        return [];
    }

    memories.filter(m => m).sort((a, b) => {
        const aSplitted = a.split(' ');
        const bSplitted = b.split(' ');
        const aNumber = aSplitted && aSplitted.length ? parseFloat(aSplitted[0]) : 0;
        const bNumber = bSplitted && bSplitted.length ? parseFloat(bSplitted[0]) : 0;
        return aNumber - bNumber;
    });
    return [...new Set(memories)];
};

module.exports = {
    convertXmlToObj,
    createRandomNumber,
    createRandomString,
    delay,
    getCurrentTimestamp,
    getFromEnv,
    isValidDate,
    sanitizeStringForRegEx,
    sortMemories,
};
