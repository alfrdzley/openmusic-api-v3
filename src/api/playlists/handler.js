const autoBind = require("auto-bind");

class PlaylistsHandler {
  constructor(service, validator, playlistSongsValidator) {
    this._service = service;
    this._validator = validator;
    this._playlistSongsValidator = playlistSongsValidator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    try {
      this._validator.validatePlaylistPayload(request.payload);
      const { name } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      const playlistId = await this._service.addPlaylist({
        name,
        owner: credentialId,
      });

      const response = h.response({
        status: "success",
        message: "Playlist berhasil ditambahkan",
        data: {
          playlistId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      const response = h.response({
        status: "fail",
        message: error.message,
      });
      response.code(error.statusCode || 500);
      response.type("application/json");
      return response;
    }
  }

  async getPlaylistsHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;
      const playlists = await this._service.getPlaylists(credentialId);

      return {
        status: "success",
        data: {
          playlists,
        },
      };
    } catch (error) {
      const response = h.response({
        status: "fail",
        message: error.message,
      });
      response.code(error.statusCode || 500);
      response.type("application/json");
      return response;
    }
  }

  async deletePlaylistByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._service.verifyPlaylistOwner(id, credentialId);
      await this._service.deletePlaylistById(id);

      return {
        status: "success",
        message: "Playlist berhasil dihapus",
      };
    } catch (error) {
      const response = h.response({
        status: "fail",
        message: error.message,
      });
      response.code(error.statusCode || 500);
      response.type("application/json");
      return response;
    }
  }

  async postSongToPlaylistHandler(request, h) {
    try {
      this._playlistSongsValidator.validatePlaylistSongPayload(request.payload);
      const { id: playlistId } = request.params;
      const { songId } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      await this._service.verifyPlaylistOwner(playlistId, credentialId);
      await this._service.addSongToPlaylist(playlistId, songId);

      const response = h.response({
        status: "success",
        message: "Lagu berhasil ditambahkan ke playlist",
      });
      response.code(201);
      return response;
    } catch (error) {
      const response = h.response({
        status: "fail",
        message: error.message,
      });
      response.code(error.statusCode || 500);
      response.type("application/json");
      return response;
    }
  }

  async getPlaylistSongsHandler(request, h) {
    try {
      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._service.verifyPlaylistOwner(playlistId, credentialId);
      const result = await this._service.getPlaylistSongs(playlistId);

      return {
        status: "success",
        data: result,
      };
    } catch (error) {
      const response = h.response({
        status: "fail",
        message: error.message,
      });
      response.code(error.statusCode || 500);
      response.type("application/json");
      return response;
    }
  }

  async deleteSongFromPlaylistHandler(request, h) {
    try {
      this._playlistSongsValidator.validatePlaylistSongPayload(request.payload);
      const { id: playlistId } = request.params;
      const { songId } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      await this._service.verifyPlaylistOwner(playlistId, credentialId);
      await this._service.deleteSongFromPlaylist(playlistId, songId);

      return {
        status: "success",
        message: "Lagu berhasil dihapus dari playlist",
      };
    } catch (error) {
      const response = h.response({
        status: "fail",
        message: error.message,
      });
      response.code(error.statusCode || 500);
      response.type("application/json");
      return response;
    }
  }

  async cleanupPlaylistsHandler(request, h) {
    try {
      const songDeleteResult = await this._service.cleanupPlaylistSongsDebug();
      const playlistDeleteResult = await this._service.cleanupPlaylistsDebug();

      return {
        status: "success",
        message: `Cleanup completed: ${songDeleteResult.rows.length} playlist songs and ${playlistDeleteResult.rows.length} playlists deleted`,
        data: {
          deletedPlaylistSongs: songDeleteResult.rows.length,
          deletedPlaylists: playlistDeleteResult.rows.length,
        },
      };
    } catch (error) {
      const response = h.response({
        status: "fail",
        message: error.message,
      });
      response.code(error.statusCode || 500);
      return response;
    }
  }
}

module.exports = PlaylistsHandler;
