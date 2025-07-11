const { nanoid } = require("nanoid/non-secure");

class SongService {
    constructor() {
        this._songs = [];
    }

    addSong({ title, year, genre, performer, duration, albumId }) {
        const id = nanoid(16);
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;

        const newSong = {
            id,
            title,
            year,
            genre,
            performer,
            duration,
            albumId,
            createdAt,
            updatedAt,
        };

        this._songs.push(newSong);

        const isSuccess =
            this._songs.filter((song) => song.id === id).length > 0;
        if (!isSuccess) {
            throw new Error("Song gagal ditambahkan");
        }
        return id;
    }
}

module.exports = SongService;