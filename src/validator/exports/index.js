const { ExportsPlaylistPayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const ExportsValidator = {
  validateExportsPlaylistPayload: (payload) => {
    const validateResult = ExportsPlaylistPayloadSchema.validate(payload);
    if (validateResult.error) {
      throw new InvariantError(validateResult.error.message);
    }
  },
};

module.exports = ExportsValidator;
