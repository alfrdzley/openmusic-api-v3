const AlbumsMapDB = ({
  id,
  name,
  year,
  created_at: createdAt,
  updated_at: updatedAt,
}) => ({
  id,
  name,
  year,
  createdAt,
  updatedAt,
});

const SongsMapDB = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  album_id: albumId,
  created_at: createdAt,
  updated_at: updatedAt,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId,
  createdAt,
  updatedAt,
});

module.exports = { AlbumsMapDB, SongsMapDB };
