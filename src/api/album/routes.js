const path = require('path');

const routes = (handler) => [
    {
        method: 'POST',
        path: '/albums',
        handler: handler.postAlbumHandler,
    },
    {
        method: 'GET',
        path: '/albums',
        handler: handler.getAlbumsHandler,
    },
    {
        method: 'GET',
        path: '/albums/{id}',
        handler: handler.getAlbumByIdHandler,
    },
    {
        method: 'PUT',
        path: '/albums/{id}',
        handler: handler.putAlbumByIdHandler,
    },
    {
        method: 'DELETE',
        path: '/albums/{id}',
        handler: handler.deleteAlbumByIdHandler,
    },
    {
        method: 'POST',
        path: '/albums/{id}/covers',
        handler: handler.uploadCoverByIdHandler,
        options: {
            payload: {
                maxBytes: 512000,
                parse: true,
                output: 'stream',
                allow: ['multipart/form-data'],
                multipart: true,
            },
        },
    },
    {
        method: 'GET',
        path: '/uploads/{param*}',
        handler: {
            directory: {
                path: path.resolve(__dirname, 'uploads'),
            },
        },
    },
    {
        method: 'GET',
        path: '/albums/{id}/likes',
        handler: handler.getAlbumLikeByIdHandler,
    },
    {
        method: 'POST',
        path: '/albums/{id}/likes',
        handler: handler.postAlbumLikeByIdHandler,
        options: {
            auth: 'openmusicapi_jwt',
        },
    },
    {
        method: 'DELETE',
        path: '/albums/{id}/likes',
        handler: handler.deleteAlbumLikeByIdHandler,
        options: {
            auth: 'openmusicapi_jwt',
        },
    },
];

module.exports = routes;
