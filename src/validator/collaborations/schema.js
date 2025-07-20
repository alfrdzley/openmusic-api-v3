const Joi = require('joi');

const CollaborationPayloadSchema = Joi.object({
  userId: Joi.string().required(),
  playlistId: Joi.string().optional(),
});

module.exports = { CollaborationPayloadSchema };
