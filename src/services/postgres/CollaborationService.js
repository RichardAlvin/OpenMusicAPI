const { Pool } = require('pg');
// const { nanoid } = require('nanoid');

class CollaborationService {
    constructor() {
        this._pool = new Pool();
    }
}

module.exports = CollaborationService;
