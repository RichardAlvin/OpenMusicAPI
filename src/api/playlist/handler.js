const autoBind = require('auto-bind');

class PlaylistHandler {
    constructor(playlistService, songService, validator) {
        this._playlistService = playlistService;
        this._songService = songService;
        this._validator = validator;

        autoBind(this);
    }

    async postPlaylistHandler(request, h) {
        this._validator.validatePlaylistPayload(request.payload);

        const { id: credentialId } = request.auth.credentials;
        const { name } = request.payload;

        const playlistId = await this._playlistService.addPlaylist({ name, credentialId });

        const response = h.response({
            status: 'success',
            message: 'Playlist berhasil ditambahkan',
            data: {
                playlistId,
            },
        });
        response.code(201);
        return response;
    }

    async getPlaylistsHandler(request) {
        const { id: credentialId } = request.auth.credentials;
        const playlists = await this._playlistService.getPlaylists({ credentialId });
        return {
            status: 'success',
            data: {
                playlists,
            },
        };
    }

    async deletePlaylistHandler(request, h) {
        const { id: playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;
        // check if playlist is exist, user owned playlist, and collaborator
        const verifyPlaylistId = await this._playlistService.checkPlaylistExist({
            playlistId, credentialId,
        });
        // check if collaborator, it can't delete the playlist
        await this._playlistService.verifyPlaylistCredential({
            playlistId, credentialId,
        });
        await this._playlistService.deletePlaylistById({ id: verifyPlaylistId });

        const response = h.response({
            status: 'success',
            message: 'Playlist berhasil dihapus',
        });
        response.code(200);

        return response;
    }

    async postPlaylistSongHandler(request, h) {
        this._validator.validatePlaylistSongPayload(request.payload);

        const { songId } = request.payload;
        const { id: playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        // check if song is exist
        const verifySongId = await this._songService.checkSongExist(songId);

        // check if playlist is exist, user owned playlist, and collaborator
        const verifyPlaylistId = await this._playlistService.checkPlaylistExist({
            playlistId, credentialId,
        });
        await this._playlistService.addPlaylistSong({
            songId: verifySongId,
            playlistId: verifyPlaylistId,
            credentialId,
        });

        const response = h.response({
            status: 'success',
            message: 'Playlist song berhasil ditambahkan',
        });
        response.code(201);
        return response;
    }

    async getPlaylistSongByIdHandler(request) {
        const { id: playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;
        // check if playlist is exist and user owned playlist
        const verifyPlaylistId = await this._playlistService.checkPlaylistExist({
            playlistId, credentialId,
        });
        const playlistSongs = await this._playlistService.getPlaylistSongs({
            playlistId: verifyPlaylistId, ownerId: credentialId,
        });
        return {
            status: 'success',
            data: {
                playlist: playlistSongs,
            },
        };
    }

    async deletePlaylistSongHandler(request, h) {
        this._validator.validatePlaylistSongPayload(request.payload);
        const { songId } = request.payload;

        const { id: playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        // check if playlist is exist and user owned playlist
        const verifyPlaylistId = await this._playlistService.checkPlaylistExist({
            playlistId, credentialId,
        });
        await this._playlistService.deletePlaylistSongById(verifyPlaylistId, songId, credentialId);

        const response = h.response({
            status: 'success',
            message: 'Playlist song berhasil dihapus',
        });
        response.code(200);

        return response;
    }

    async getPlaylistActivityHandler(request) {
        const { id: playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        // check if playlist is exist, user owned playlist, and collaborator
        const verifyPlaylistId = await this._playlistService.checkPlaylistExist({
            playlistId, credentialId,
        });

        const playlistActivities = await this._playlistService.getPlaylistActivity({
            playlistId: verifyPlaylistId, ownerId: credentialId,
        });
        return {
            status: 'success',
            data: playlistActivities,
        };
    }
}

module.exports = PlaylistHandler;
