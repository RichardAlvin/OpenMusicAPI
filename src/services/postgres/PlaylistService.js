const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const { playlistMapping } = require('../../utils');

class PlaylistService {
    constructor() {
        this._pool = new Pool();
    }

    async addPlaylist({ name, credentialId }) {
        const id = nanoid(16);

        const query = {
            text: 'INSERT INTO playlist VALUES($1, $2, $3) RETURNING id',
            values: [id, name, credentialId],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Playlist gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    async getPlaylists({ credentialId }) {
        const query = {
            text: `SELECT playlist.*, users.username FROM playlist
            LEFT JOIN playlist_collaboration ON playlist."id" = playlist_collaboration."playlistId" 
            LEFT JOIN users ON playlist."ownerId" = users.id 
            WHERE playlist."ownerId" = $1 or playlist_collaboration."userId" = $1
            GROUP BY playlist.id, users.username`,
            values: [credentialId],
        };
        const result = await this._pool.query(query);
        return result.rows.map(playlistMapping);
    }

    async deletePlaylistById({ id }) {
        const query = {
            text: 'DELETE FROM playlist WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Playlists gagal dihapus. Id tidak ditemukan');
        }
    }

    async addPlaylistSong({ songId, playlistId, credentialId }) {
        const id = nanoid(16);

        const query = {
            text: 'INSERT INTO playlist_song VALUES($1, $2, $3) RETURNING id',
            values: [id, playlistId, songId],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Playlist song gagal ditambahkan');
        }

        // store delete activity in playlist_activity
        const idActivity = nanoid(16);
        const time = new Date().toISOString();
        const queryPlaylistActivity = {
            text: 'INSERT INTO playlist_activity VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
            values: [idActivity, playlistId, songId, credentialId, 'add', time],
        };
        await this._pool.query(queryPlaylistActivity);
    }

    async getPlaylistSongs({ playlistId, ownerId }) {
        const queryPlaylist = {
            text: `SELECT playlist.id, playlist.name, users.username
            FROM playlist
            LEFT JOIN playlist_collaboration ON playlist.id = playlist_collaboration."playlistId"
            LEFT JOIN users ON playlist."ownerId" = users.id
            WHERE playlist.id = $1 AND (playlist."ownerId" = $2 OR playlist_collaboration."userId" = $2)`,
            values: [playlistId, ownerId],
        };
        const resultPlaylist = await this._pool.query(queryPlaylist);
        if (!resultPlaylist.rows.length) {
            throw new NotFoundError('Playlist tidak ditemukan');
        }

        // get the playlist song
        const queryPlaylistSong = {
            text: `SELECT song.id, song.title, song.performer
            FROM playlist_song
            LEFT JOIN song ON playlist_song."songId" = song.id
            WHERE playlist_song."playlistId" = $1`,
            values: [playlistId],
        };
        const resultPlaylistSong = await this._pool.query(queryPlaylistSong);

        const playlistSongData = {
            id: resultPlaylist.rows[0].id,
            name: resultPlaylist.rows[0].name,
            username: resultPlaylist.rows[0].username,
            songs: resultPlaylistSong.rows.map((song) => ({
                id: song.id,
                title: song.title,
                performer: song.performer,
            })),
        };

        return playlistSongData;
    }

    async deletePlaylistSongById(playlistId, songId, credentialId) {
        const query = {
            text: 'DELETE FROM playlist_song WHERE "playlistId" = $1 AND "songId" = $2 RETURNING id',
            values: [playlistId, songId],
        };
        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Playlists song gagal dihapus.');
        }

        // store delete activity in playlist_activity
        const id = nanoid(16);
        const time = new Date().toISOString();
        const queryPlaylistActivity = {
            text: 'INSERT INTO playlist_activity VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
            values: [id, playlistId, songId, credentialId, 'delete', time],
        };
        await this._pool.query(queryPlaylistActivity);
    }

    async getPlaylistActivity({ playlistId, ownerId }) {
        const query = {
            text: `SELECT playlist_activity.*, users.username, song.title
            FROM playlist_activity
            LEFT JOIN users ON playlist_activity."userId" = users.id
            LEFT JOIN song ON playlist_activity."songId" = song.id 
            WHERE playlist_activity."playlistId" = $1 AND playlist_activity."userId" = $2`,
            values: [playlistId, ownerId],
        };
        const result = await this._pool.query(query);

        const playlistActivityData = {
            playlistId: result.rows[0].playlistId,
            activities: result.rows.map((activity) => ({
                username: activity.username,
                title: activity.title,
                action: activity.action,
                time: activity.time,
            })),
        };

        return playlistActivityData;
    }

    async checkPlaylistExist({ playlistId, credentialId }) {
        const query = {
            text: 'SELECT playlist.id, playlist."ownerId" FROM playlist WHERE "id" = $1',
            values: [playlistId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Playlist tidak ditemukan.');
        }

        // check if user is collaboration of the playlist
        const queryCollaborator = {
            text: 'SELECT * FROM playlist_collaboration WHERE "userId" = $1 AND "playlistId" = $2',
            values: [credentialId, playlistId],
        };

        const resultCollaborator = await this._pool.query(queryCollaborator);
        if (resultCollaborator.rows.length) {
            return resultCollaborator.rows[0].playlistId;
        }

        const playlistOwnerId = result.rows[0].ownerId;
        if (playlistOwnerId !== credentialId) {
            throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
        }

        return result.rows[0].id;
    }

    async verifyPlaylistCredential({ playlistId, credentialId }) {
        const query = {
            text: 'SELECT playlist.id, playlist."ownerId" FROM playlist WHERE "id" = $1 AND "ownerId" = $2',
            values: [playlistId, credentialId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
        }
    }
}

module.exports = PlaylistService;
