const autoBind = require('auto-bind');

class ExportHandler {
    constructor(ProducerService, playlistService, validator) {
        this._producerService = ProducerService;
        this._playlistService = playlistService;
        this._validator = validator;

        autoBind(this);
    }

    async postExportPlaylistHandler(request, h) {
        this._validator.validateExportPlaylistPayload(request.payload);
        const { playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        // check if the playlist is exist
        await this._playlistService.checkPlaylistExist({ playlistId, credentialId });

        const message = {
            userId: request.auth.credentials.id,
            playlistId,
            targetEmail: request.payload.targetEmail,
        };

        await this._producerService.sendMessage('export:playlist', JSON.stringify(message));

        const response = h.response({
            status: 'success',
            message: 'Permintaan Anda dalam antrean',
        });
        response.code(201);
        return response;
    }
}

module.exports = ExportHandler;
