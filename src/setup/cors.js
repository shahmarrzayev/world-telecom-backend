const cors = require('cors');
const helmet = require('helmet');

const configureCors = app => {
    app.set('trust proxy', true);
    app.use(helmet());
    app.use(
        cors({
            origin: true,
            credentials: true,
            exposedHeaders: ['x-w-t-access-token', 'x-w-t-refresh-token'],
            methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
        })
    );
};

module.exports = configureCors;
