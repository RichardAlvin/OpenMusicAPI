const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class CollaborationService {
    constructor() {
        this._pool = new Pool();
    }

    async addCollaboration({ playlistId, userId }) {
        const id = `collab-${nanoid(16)}`;

        const query = {
            text: 'INSERT INTO playlist_collaboration VALUES($1, $2, $3) RETURNING id',
            values: [id, playlistId, userId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Kolaborasi gagal ditambahkan');
        }
        return result.rows[0].id;
    }

    async deleteCollaboration(playlistId, userId) {
        const query = {
            text: 'DELETE FROM playlist_collaboration WHERE "playlistId" = $1 AND "userId" = $2 RETURNING id',
            values: [playlistId, userId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Kolaborasi gagal dihapus');
        }
    }

    async verifyCollaborator(playlistId, userId) {
        const query = {
            text: 'SELECT * FROM playlist_collaboration WHERE "playlistId" = $1 AND "userId" = $2',
            values: [playlistId, userId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Kolaborasi gagal diverifikasi');
        }
    }
}

module.exports = CollaborationService;
