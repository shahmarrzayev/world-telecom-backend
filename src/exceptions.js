function BadRequestException(message) {
    Error.captureStackTrace(this, this.constructor);
    this.title = 'Bad request';
    this.code = 400;
    this.message = message || 'Bad request';
}

function ConflictException(message) {
    Error.captureStackTrace(this, this.constructor);
    this.title = 'Conflict';
    this.code = 409;
    this.message = message || 'Already exists';
}

function ForbiddenException(message) {
    Error.captureStackTrace(this, this.constructor);
    this.title = 'Forbidden';
    this.code = 403;
    this.message = message || 'Forbidden';
}

function GeneralException(message) {
    Error.captureStackTrace(this, this.constructor);
    this.title = 'Internal server error';
    this.code = 500;
    this.message = message || 'Internal server error';
}

function NotFoundException(message) {
    Error.captureStackTrace(this, this.constructor);
    this.title = 'Not found';
    this.code = 404;
    this.message = message || 'Not found';
}

function UnauthorizedException(message) {
    Error.captureStackTrace(this, this.constructor);
    this.title = 'Unauthorized';
    this.code = 401;
    this.message = message || 'Unauthorized';
}

module.exports = {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    GeneralException,
    NotFoundException,
    UnauthorizedException,
};
