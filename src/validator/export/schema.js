const Joi = require('joi');

const ExportPayloadSchema = Joi.object({
    targetEmail: Joi.string().required(),
});

module.exports = { ExportPayloadSchema };
