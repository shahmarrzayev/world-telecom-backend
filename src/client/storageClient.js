const aws = require('aws-sdk');
const winston = require('winston');

const { Env } = require('../enums');
const { getFromEnv } = require('../utils/commonUtils');

const s3 = new aws.S3({
    endpoint: new aws.Endpoint('ams3.digitaloceanspaces.com'),
    accessKeyId: getFromEnv(Env.W_T_DIGITAL_OCEAN_SPACES_KEY),
    secretAccessKey: getFromEnv(Env.W_T_DIGITAL_OCEAN_SPACES_SECRET),
});

/**
 * Upload file to Digitalcean Spaces and get url.
 * @param {String} fileName
 * @param {Buffer} fileBuffer
 * @param {Boolean} private
 * @returns {Promise<String>} url
 */
const uploadFileToSpaces = (fileName, fileBuffer, isRestricted) => {
    return new Promise(resolve => {
        winston.debug('storageClient.uploadFileToSpaces -- start');
        if (!fileName || !fileBuffer) {
            winston.warn('storageClient.uploadFileToSpaces -- null param');
            resolve(null);
        }

        const folder = isRestricted ? 'w-t-files' : 'images';

        const params = {
            Bucket: `w-t/${folder}`,
            Key: fileName,
            Body: fileBuffer,
            ACL: isRestricted ? 'private' : 'public-read',
        };

        s3.putObject(params, err => {
            if (err) {
                winston.error(`storageClient.uploadFileToSpaces -- ${JSON.stringify(err)}`);
                resolve(null);
            } else {
                winston.debug('storageClient.uploadFileToSpaces -- success');
                resolve(`https://w-t.ams3.cdn.digitaloceanspaces.com/${folder}/${fileName}`);
            }
        });
    });
};

module.exports = {
    s3,
    uploadFileToSpaces,
};
