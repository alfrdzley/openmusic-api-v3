const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(service, validator, uploadsValidator) {
    this._albumsService = service.albumsService;
    this._storageService = service.storageService;
    this._validator = validator;
    this._uploadsValidator = uploadsValidator;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);
      const { name, year } = request.payload;
      const albumId = await this._albumsService.addAlbum({ name, year });

      const response = h.response({
        status: 'success',
        message: 'Album berhasil ditambahkan',
        data: {
          albumId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      const response = h.response({
        status: 'fail',
        message: error.message,
      });
      response.code(error.statusCode || 500);
      return response;
    }
  }

  async getAlbumsHandler() {
    const albums = await this._albumsService.getAlbums();
    return {
      status: 'success',
      data: {
        albums,
      },
    };
  }

  async getAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const album = await this._albumsService.getAlbumById(id);

      // ✅ Fix: coverUrl sudah ter-map dari AlbumsMapDB di utils
      // Tidak perlu manipulasi manual karena coverUrl sudah ada dari database

      const response = h.response({
        status: 'success',
        data: {
          album,
        },
      });
      response.type('application/json');
      return response;
    } catch (error) {
      const response = h.response({
        status: 'fail',
        message: error.message,
      });
      response.code(error.statusCode || 500);
      response.type('application/json');
      return response;
    }
  }

  async putAlbumByIdHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);
      const { id } = request.params;
      const { name, year } = request.payload;

      await this._albumsService.editAlbumById(id, { name, year });

      return {
        status: 'success',
        message: 'Album berhasil diperbarui',
      };
    } catch (error) {
      const response = h.response({
        status: 'fail',
        message: error.message,
      });
      response.code(error.statusCode || 500);
      return response;
    }
  }

  async deleteAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this._albumsService.deleteAlbumById(id);

      return {
        status: 'success',
        message: 'Album berhasil dihapus',
      };
    } catch (error) {
      const response = h.response({
        status: 'fail',
        message: error.message,
      });
      response.code(error.statusCode || 500);
      return response;
    }
  }

  async postUploadCoverHandler(request, h) {
    try {
      const { cover } = request.payload;
      const { id } = request.params; // ✅ Fix: Parameter konsisten dengan route lain

      // 1. Validasi file ada
      if (!cover) {
        return h
          .response({
            status: 'fail',
            message: 'Cover file is required',
          })
          .code(400)
          .type('application/json');
      }

      // 2. Validasi MIME type
      this._uploadsValidator.validateImageHeaders(cover.hapi.headers);

      // 3. Validasi ukuran file maksimal 512000 bytes
      const fileSize = cover.hapi.headers['content-length'] || 0;
      if (fileSize > 512000) {
        return h
          .response({
            status: 'fail',
            message: 'Payload content length greater than maximum allowed: 512000',
          })
          .code(413)
          .type('application/json');
      }

      // 4. Simpan file ke storage
      const filename = await this._storageService.writeFile(cover, cover.hapi);

      // 5. Buat URL yang dapat diakses publik
      const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;

      // 6. ✅ CRITICAL: Update database dengan cover URL
      await this._albumsService.editAlbumCoverById(id, fileLocation);

      // 7. Return response sesuai spesifikasi
      return h
        .response({
          status: 'success',
          message: 'Sampul berhasil diunggah',
        })
        .code(201)
        .type('application/json');
    } catch (error) {
      console.error('Upload error:', error);

      return h
        .response({
          status: 'fail',
          message: error.message,
        })
        .code(error.statusCode || 500)
        .type('application/json');
    }
  }
}

module.exports = AlbumsHandler;
