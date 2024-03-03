'use strict'

const StatusCode = {
    FORBIDDEN: 403,
    UNAUTHORIZED: 401,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    CONFLICT: 409,
}

const ReasonPhrase = {
    FORBIDDEN: 'Forbidden',
    UNAUTHORIZED: 'Unauthorized',
    BAD_REQUEST: 'Bad Request', 
    NOT_FOUND: 'Not Found',
    CONFLICT: 'Conflict',
}

class ErrorResponse extends Error{
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

class ConflictRequestError extends ErrorResponse {
    constructor(message = ReasonPhrase.CONFLICT, statusCode = StatusCode.CONFLICT) {
        super(message, statusCode);
    }
}

class BadRequestError extends ErrorResponse {
    constructor(message = ReasonPhrase.BAD_REQUEST, statusCode = StatusCode.BAD_REQUEST) {
        super(message, statusCode);
    }
}

module.exports = { 
    ConflictRequestError,
    BadRequestError
 }