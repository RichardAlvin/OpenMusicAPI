const CollaborationHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'collaboration',
    version: '1.0.0',
    register: async (server, { service, validator }) => {
        const collaborationHandler = new CollaborationHandler(service, validator);
        server.route(routes(collaborationHandler));
    },
};
