const autoBind = require('auto-bind');

class CollaborationHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        autoBind(this);
    }

    async postCollaborationHandler(request, h) {
        this._validator.validateAlbumPayload(request.payload);
        const { name, year } = request.payload;

        const albumId = await this._service.addAlbum({ name, year });
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

    async deleteCollaborationHandler(request, h) {
        const { id } = request.params;
        await this._service.deleteAlbumById(id);

        const response = h.response({
            status: 'success',
            message: 'Album berhasil dihapus',
        });
        response.code(200);

        return response;
    }
}

module.exports = CollaborationHandler;
