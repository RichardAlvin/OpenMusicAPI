const ExportHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'export',
    version: '1.0.0',
    register: async (server, { ProducerService, playlistService, validator }) => {
        const exportHandler = new ExportHandler(ProducerService, playlistService, validator);
        server.route(routes(exportHandler));
    },
};
