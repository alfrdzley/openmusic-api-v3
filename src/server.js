const Hapi = require("@hapi/hapi");
const albums = require("./api/albums");
const AlbumsService = require("./services/inMemory/AlbumsService");
const AlbumsValidator = require("./api/validator/albums");

require("dotenv").config();
const init = async () => {
  const albumsService = new AlbumsService();
  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: process.env.NODE_ENV !== "production" ? "localhost" : "0.0.0.0",
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  await server.register({
    plugin: albums,
    options: {
      service: albumsService,
      validator: AlbumsValidator
    }
  })

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
