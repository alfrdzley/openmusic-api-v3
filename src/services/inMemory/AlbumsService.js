const { nanoid } = require('nanoid');
const InvariantError = require('../../api/exeptions/InvariantError');
const NotFoundError = require('../../api/exeptions/NotFoundError');

class AlbumsService {
  constructor() {
    this._albums = [];
  }

  addAlbum({ name, year }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const newAlbum = {
      id,
      name,
      year,
      createdAt,
      updatedAt,
    };

    this._albums.push(newAlbum);

    const isSuccess = this._albums.filter((album) => album.id === id).length > 0;
    if (!isSuccess) {
      throw new InvariantError('Album gagal ditambahkan');
    }
    return id;
  }

  getAlbums() {
    return this._albums;
  }

  getAlbumById(id) {
    const album = this._albums.filter((item) => item.id === id)[0];
    if (!album) {
      throw new NotFoundError('Album tidak ditemukan');
    }
    return album;
  }

  editAlbumById(id, { name, year }) {
    const index = this._albums.findIndex((album) => album.id === id);
    if (index === -1) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }

    const updatedAt = new Date().toISOString();
    this._albums[index] = {
      ...this._albums[index],
      name,
      year,
      updatedAt,
    };

    return this._albums[index];
  }

  deleteAlbumById(id) {
    const index = this._albums.findIndex((album) => album.id === id);
    if (index === -1) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }

    this._albums.splice(index, 1);
    return { message: 'Album berhasil dihapus' };
  }
}

module.exports = AlbumsService;
