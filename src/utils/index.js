const AlbumsMapDB = ({ id, name, year, createdAt, updatedAt }) => ({
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
  albumId,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId,
});

module.exports = { AlbumsMapDB, SongsMapDB };
