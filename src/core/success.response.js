'use strict'

const StatusCode = {
    OK: 200,
    CREATED: 201,
}

const ReasonPhrase = {
    OK: 'Success',
    CREATED: 'Created',

}

class SuccessResponse {
    constructor({message, statusCode = StatusCode.OK, reasonStatus = ReasonPhrase.OK, metadata = {}}) {
        this.message = !message ? reasonStatus : message;
        this.statusCode = statusCode;
        this.metadata = metadata;
    }

    send(res, headers = {}) {
        return res.status(this.statusCode).json(this)
    }
}

class OK extends SuccessResponse {
    constructor({message, metadata}) {
        super({ message, metadata });
    }
}

class Created extends SuccessResponse {
    constructor({message, statusCode = StatusCode.CREATED, reasonStatus = ReasonPhrase.CREATED, metadata = {}}) {
        super({ message, statusCode, reasonStatus, metadata });
    }
}

module.exports = {
    SuccessResponse,
    OK,
    Created
}