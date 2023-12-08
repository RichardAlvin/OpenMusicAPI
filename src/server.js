const Hapi = require('@hapi/hapi');
const album = require('./api/album');
// const AlbumService = require('./services/inMemory/AlbumService');
// const AlbumValidator = require('./validator/album');

const init= async () =>{
    const server = Hapi.server({
        port:5000,
        host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
        routes: {
            cors: {
                origin: ['*'],
            }
        }
    })

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
}

init();