require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');

const ClientError = require('./exceptions/ClientError');

//  album
const album = require('./api/album');
const AlbumService = require('./services/postgres/AlbumService');
const AlbumValidator = require('./validator/album');

//  song
const song = require('./api/song');
const SongService = require('./services/postgres/SongService');
const SongValidator = require('./validator/song');

// user
const user = require('./api/user');
const UserService = require('./services/postgres/UserService');
const UserValidator = require('./validator/user');

// authentication
const authentication = require('./api/authentication');
const AuthenticationService = require('./services/postgres/AuthenticationService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationValidator = require('./validator/authentication');

// playlist
const playlist = require('./api/playlist');
const PlaylistService = require('./services/postgres/PlaylistService');
const PlaylistValidator = require('./validator/playlist');

// collaboration playlist
const collaboration = require('./api/collaboration');
const CollaborationService = require('./services/postgres/CollaborationService');
const CollaborationValidator = require('./validator/collaboration');

// export playlist
const _export = require('./api/export');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportValidator = require('./validator/export');

// storage service
const StorageService = require('./services/storage/StorageService');

// cache service
const CacheService = require('./services/redis/CacheService');

const init = async () => {
    const cacheService = new CacheService();
    const collaborationService = new CollaborationService();
    const albumService = new AlbumService(cacheService);
    const songService = new SongService();
    const playlistService = new PlaylistService();
    const userService = new UserService();
    const authenticationService = new AuthenticationService();
    const storageService = new StorageService(path.resolve(__dirname, 'api/album/uploads/covers'));

    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    // registrasi plugin eksternal
    await server.register([
        {
            plugin: Jwt,
        },
        {
            plugin: Inert,
        },
    ]);

    // mendefinisikan strategy autentikasi jwt
    server.auth.strategy('openmusicapi_jwt', 'jwt', {
        keys: process.env.ACCESS_TOKEN_KEY,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: process.env.ACCESS_TOKEN_AGE,
        },
        validate: (artifacts) => ({
            isValid: true,
            credentials: {
                id: artifacts.decoded.payload.id,
            },
        }),
    });

    await server.register([
        {
            plugin: album,
            options: {
                albumService,
                storageService,
                validator: AlbumValidator,
            },
        },
        {
            plugin: song,
            options: {
                service: songService,
                validator: SongValidator,
            },
        },
        {
            plugin: user,
            options: {
                service: userService,
                validator: UserValidator,
            },
        },
        {
            plugin: authentication,
            options: {
                authenticationService,
                userService,
                tokenManager: TokenManager,
                validator: AuthenticationValidator,
            },
        },
        {
            plugin: playlist,
            options: {
                playlistService,
                songService,
                validator: PlaylistValidator,
            },
        },
        {
            plugin: collaboration,
            options: {
                collaborationService,
                playlistService,
                userService,
                validator: CollaborationValidator,
            },
        },
        {
            plugin: _export,
            options: {
                ProducerService,
                playlistService,
                validator: ExportValidator,
            },
        },
    ]);

    server.ext('onPreResponse', (request, h) => {
        const { response } = request;
        if (response instanceof Error) {
            if (response instanceof ClientError) {
                const newResponse = h.response({
                    status: 'fail',
                    message: response.message,
                });
                newResponse.code(response.statusCode);
                return newResponse;
            }
            if (!response.isServer) {
                return h.continue;
            }
            const newResponse = h.response({
                status: 'error',
                message: 'terjadi kegagalan pada server kami',
            });
            newResponse.code(500);
            return newResponse;
        }
        return h.continue;
    });

    await server.start();
};

init();
