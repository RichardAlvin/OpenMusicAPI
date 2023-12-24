const autoBind = require('auto-bind');

class AlbumHandler {
    constructor(albumService, storageService, validator) {
        this._albumService = albumService;
        this._storageService = storageService;
        this._validator = validator;

        autoBind(this);
    }

    async postAlbumHandler(request, h) {
        this._validator.validateAlbumPayload(request.payload);
        const { name, year } = request.payload;

        const albumId = await this._albumService.addAlbum({ name, year });
        const response = h.response({
            status: 'success',
            message: 'Album berhasil ditambahkan',
            data: {
                albumId,
            },
        });
        response.code(201);

        return response;
    }

    async getAlbumsHandler(h) {
        const { albums, cached } = await this._albumService.getAlbums();
        const response = h.response({
            status: 'success',
            data: {
                albums,
            },
        });
        if (cached) {
            response.header('X-Data-Source', 'cache');
        }
    }

    async getAlbumByIdHandler(request, h) {
        const { id } = request.params;
        const album = await this._albumService.getAlbumById(id);
        const response = h.response({
            status: 'success',
            message: `Album - ${album.name} berhasil didapatkan`,
            data: {
                album,
            },
        });
        response.code(200);

        return response;
    }

    async putAlbumByIdHandler(request, h) {
        this._validator.validateAlbumPayload(request.payload);
        const { id } = request.params;

        await this._albumService.editAlbumById(id, request.payload);

        const response = h.response({
            status: 'success',
            message: 'Album berhasil diperbarui',
        });
        response.code(200);

        return response;
    }

    async deleteAlbumByIdHandler(request, h) {
        const { id } = request.params;
        await this._albumService.deleteAlbumById(id);

        const response = h.response({
            status: 'success',
            message: 'Album berhasil dihapus',
        });
        response.code(200);

        return response;
    }

    async uploadCoverByIdHandler(request, h) {
        const { cover } = request.payload;
        const { id } = request.params;
        this._validator.validateCoverHeaders(cover.hapi.headers);

        const filename = await this._storageService.writeFile(cover, cover.hapi);
        const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/uploads/covers/${filename}`;

        // store the file location
        await this._albumService.updateCoverAlbumById(id, fileLocation);

        const response = h.response({
            status: 'success',
            message: 'Sampul berhasil diunggah',
        });
        response.code(201);
        return response;
    }

    async getAlbumLikeByIdHandler(request, h) {
        const { id: albumId } = request.params;
        const { likes, cached } = await this._albumService.getAlbumLike(albumId);
        const response = h.response({
            status: 'success',
            data: {
                likes,
            },
        });
        if (cached) {
            response.header('X-Data-Source', 'cache');
        }
        return response;
    }

    async postAlbumLikeByIdHandler(request, h) {
        const { id: credentialId } = request.auth.credentials;
        const { id: albumId } = request.params;

        await this._albumService.checkAlbumExist(albumId);
        await this._albumService.postAlbumLike({ albumId, credentialId });

        const response = h.response({
            status: 'success',
            message: 'Like berhasil ditambahkan',
        });
        response.code(201);
        return response;
    }

    async deleteAlbumLikeByIdHandler(request, h) {
        const { id: credentialId } = request.auth.credentials;
        const { id: albumId } = request.params;

        await this._albumService.checkAlbumExist(albumId);
        await this._albumService.deleteAlbumLike({ albumId, credentialId });

        const response = h.response({
            status: 'success',
            message: 'Like berhasil dihapus',
        });
        response.code(200);
        return response;
    }
}

module.exports = AlbumHandler;
