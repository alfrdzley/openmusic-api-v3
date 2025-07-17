const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exeptions/InvariantError");
const NotFoundError = require("../../exeptions/NotFoundError");
const AuthenticationError = require("../../exeptions/AuthenticationError");
const AuthorizationError = require("../../exeptions/AuthorizationError");

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist({ name, owner }) {
    await this.verifyOwnerExists(owner);

    const id = `playlist-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: "INSERT INTO playlists (id, name, owner, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      values: [id, name, owner, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError("Playlist gagal ditambahkan");
    }
    return result.rows[0].id;
  }

  async verifyOwnerExists(userId) {
    const query = {
      text: "SELECT id FROM users WHERE id = $1",
      values: [userId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new AuthenticationError("User tidak ditemukan");
    }
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT p.id, p.name, u.username FROM playlists p LEFT JOIN users u ON u.id = p.owner WHERE p.owner = $1`,
      values: [owner],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getPlaylistById(id) {
    const query = {
      text: "SELECT id, name, owner FROM playlists WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }
    return result.rows[0];
  }

  async editPlaylistById(id, { name }) {
    const updatedAt = new Date().toISOString();

    const query = {
      text: "UPDATE playlists SET name = $1, updated_at = $2 WHERE id = $3 RETURNING id",
      values: [name, updatedAt, id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Gagal memperbarui playlist. Id tidak ditemukan");
    }
  }

  async deletePlaylistById(id) {
    const query = {
      text: "DELETE FROM playlists WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Playlist gagal dihapus. Id tidak ditemukan");
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: "SELECT owner FROM playlists WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }

    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError("Anda tidak berhak mengakses resource ini");
    }
  }

  async verifySongExists(songId) {
    const query = {
      text: "SELECT id FROM songs WHERE id = $1",
      values: [songId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Lagu tidak ditemukan");
    }
  }

  async addSongToPlaylist(playlistId, songId) {
    await this.verifySongExists(songId);

    const id = `playlist-song-${nanoid(16)}`;
    const query = {
      text: "INSERT INTO playlist_songs (id, playlist_id, song_id) VALUES ($1, $2, $3) RETURNING id",
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError("Lagu gagal ditambahkan ke playlist");
    }
  }

  async getPlaylistSongs(playlistId) {
    const playlistQuery = {
      text: `SELECT p.id, p.name, u.username FROM playlists p LEFT JOIN users u ON u.id = p.owner WHERE p.id = $1`,
      values: [playlistId],
    };

    const playlistResult = await this._pool.query(playlistQuery);
    if (!playlistResult.rows.length) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }

    const songsQuery = {
      text: `SELECT s.id, s.title, s.performer FROM songs s INNER JOIN playlist_songs ps ON ps.song_id = s.id WHERE ps.playlist_id = $1`,
      values: [playlistId],
    };

    const songsResult = await this._pool.query(songsQuery);

    return {
      playlist: {
        ...playlistResult.rows[0],
        songs: songsResult.rows,
      },
    };
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: "DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id",
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError("Lagu gagal dihapus dari playlist");
    }
  }
}

module.exports = PlaylistsService;
