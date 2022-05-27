const validateArrayOfObjectIds = object => {
    if (!object || !object.length) return 'Invalid request';

    let error;
    object.forEach(elem => {
        if (typeof elem !== 'string' || !elem.match(/^[0-9a-fA-F]{24}$/)) {
            error = 'Invalid request';
        }
    });

    return error;
};

module.exports = {
    validateArrayOfObjectIds,
};
