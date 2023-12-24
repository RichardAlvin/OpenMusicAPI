const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumService {
    constructor(cacheService) {
        this._pool = new Pool();
        this._cacheService = cacheService;
    }

    async addAlbum({ name, year }) {
        const id = nanoid(16);

        const query = {
            text: 'INSERT INTO album VALUES($1, $2, $3) RETURNING id',
            values: [id, name, year],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Album gagal ditambahkan');
        }

        await this._cacheService.delete('albums:all');
        return result.rows[0].id;
    }

    async getAlbums() {
        try {
            const result = await this._cacheService.get('albums:all');
            return { albums: JSON.parse(result), cached: true };
        } catch (error) {
            const result = await this._pool.query('SELECT * FROM album');
            await this._cacheService.set('albums:all', JSON.stringify(result.rows));
            return result.rows;
        }
    }

    async getAlbumById(id) {
        const queryAlbum = {
            text: `SELECT *
            FROM album 
            WHERE id = $1`,
            values: [id],
        };
        const resultAlbum = await this._pool.query(queryAlbum);

        if (!resultAlbum.rows.length) {
            throw new NotFoundError('Album tidak ditemukan');
        }

        const querySong = {
            text: `SELECT * 
            FROM song 
            WHERE "albumId" = $1`,
            values: [id],
        };
        const resultSong = await this._pool.query(querySong);

        const albumData = {
            id: resultAlbum.rows[0].id,
            name: resultAlbum.rows[0].name,
            year: resultAlbum.rows[0].year,
            coverUrl: resultAlbum.rows[0].cover,
            songs: resultSong.rows.map((song) => ({
                id: song.id,
                title: song.title,
                performer: song.performer,
            })),
        };

        return albumData;
    }

    async editAlbumById(id, { name, year }) {
        const query = {
            text: 'UPDATE album SET name = $1, year = $2 WHERE id = $3 RETURNING id',
            values: [name, year, id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
        }
        await this._cacheService.delete('albums:all');
    }

    async updateCoverAlbumById(id, fileLocation) {
        const query = {
            text: 'UPDATE album SET cover = $1 WHERE id = $2 RETURNING id',
            values: [fileLocation, id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Gagal memperbarui cover album.');
        }
        await this._cacheService.delete('albums:all');
    }

    async deleteAlbumById(id) {
        const query = {
            text: 'DELETE FROM album WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
        }

        await this._cacheService.delete(`album:${id}`);
        await this._cacheService.delete('albums:all');
    }

    async getAlbumLike(albumId) {
        try {
            const result = await this._cacheService.get(`album:${albumId}`);
            return { likes: JSON.parse(result), cached: true };
        } catch (error) {
            const query = {
                text: 'SELECT * FROM album_like WHERE "albumId" = $1',
                values: [albumId],
            };

            const result = await this._pool.query(query);
            await this._cacheService.set(`album:${albumId}`, JSON.stringify(result.rows.length));
            return { likes: result.rows.length, cached: false };
        }
    }

    async postAlbumLike({ albumId, credentialId }) {
        const id = nanoid(16);

        // check if album already get like specific user
        await this.checkDuplicateAlbumLike({ albumId, credentialId });

        const userId = credentialId;
        const query = {
            text: 'INSERT INTO album_like VALUES($1, $2, $3) RETURNING id',
            values: [id, userId, albumId],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Like gagal ditambahkan');
        }

        await this._cacheService.delete(`album:${albumId}`);
        return result.rows[0].id;
    }

    async deleteAlbumLike({ albumId, credentialId }) {
        const query = {
            text: 'DELETE FROM album_like WHERE "userId" = $1 AND "albumId" = $2 RETURNING id',
            values: [credentialId, albumId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
        }
        await this._cacheService.delete(`album:${albumId}`);
    }

    async checkAlbumExist(albumId) {
        const query = {
            text: 'SELECT * FROM album WHERE "id" = $1',
            values: [albumId],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Album tidak ditemukan');
        }
    }

    async checkDuplicateAlbumLike({ albumId, credentialId }) {
        const query = {
            text: 'SELECT COUNT(*) FROM album_like WHERE "albumId" = $1 AND "userId" = $2',
            values: [albumId, credentialId],
        };
        const result = await this._pool.query(query);

        if (result.rows[0].count !== '0') {
            throw new InvariantError('Duplikasi Album Like');
        }
    }
}

module.exports = AlbumService;
