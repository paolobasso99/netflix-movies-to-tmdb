const axios = require("axios");

module.exports = class Commands {
  static async add(id, title) {
    const MoviesDB = require("./movies/MoviesDB");
    const TraktAPI = require("./trakt/TraktAPI");

    const { TRAKT_CLIENT_ID } = process.env;
    const traktAPI = new TraktAPI(TRAKT_CLIENT_ID);

    // If IMDB id is provided transfor to TMDB id
    if (typeof id === "string" && id.startsWith("tt")) {
      console.log("Transforming IMDB id to a TMDB id...");
      try {
        id = await traktAPI.gettmdbIdbyIMDBId(id);

        if (!id) {
          throw "Unable to find the TMDB id of this IMDB id!";
        }
      } catch (error) {
        console.error(error);
      }
    }

    if (id) {
      try {
        // Add to DB
        console.log("Adding movie to the database...");

        const moviesDB = new MoviesDB();
        await moviesDB.createMoviesTableIfNotExists();
        await moviesDB.addMovie(id, title);
        console.log("Movie successfully added to the database!");

        // Add to Trakt
        console.log("Adding movie to the Trakt playlist...");

        const TraktAuthenticator = require("./trakt/TraktAuthenticator");

        // Get access token
        const { TRAKT_CLIENT_SECRET } = process.env;
        const traktAuthenticator = new TraktAuthenticator(
          TRAKT_CLIENT_ID,
          TRAKT_CLIENT_SECRET
        );
        const accessToken = await traktAuthenticator.getSavedAccessCode();

        // Save movies
        if (accessToken) {
          const { TRAKT_USERNAME, TRAKT_LIST } = process.env;

          await traktAPI.addMoviesBytmdbIds(
            [id],
            accessToken,
            TRAKT_USERNAME,
            TRAKT_LIST
          );
          console.log("Movie successfully added to the Trakt playlist!");
        } else {
          // Create Token and restart
          console.error(
            "Trakt's user has not been authenticated, please use the 'auth' command"
          );
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  static async auth() {
    const TraktAuthenticator = require("./trakt/TraktAuthenticator");

    try {
      const { TRAKT_CLIENT_ID, TRAKT_CLIENT_SECRET } = process.env;
      const traktAuthenticator = new TraktAuthenticator(
        TRAKT_CLIENT_ID,
        TRAKT_CLIENT_SECRET
      );

      traktAuthenticator.start();
    } catch (error) {
      console.error(error);
    }
  }

  static async start() {
    // Load env vars
    const {
      MOVIES_SOURCE_URL,
      TMDB_API_KEY,
      TRAKT_CLIENT_ID,
      TRAKT_CLIENT_SECRET,
      TRAKT_USERNAME,
      TRAKT_LIST,
      HEALTHCHECKS_URL,
    } = process.env;

    if (HEALTHCHECKS_URL) {
      await axios.get(HEALTHCHECKS_URL + "/start");
    }

    const MoviesService = require("./movies/MoviesService");
    const MoviesDB = require("./movies/MoviesDB");
    const TraktAPI = require("./trakt/TraktAPI");
    const TraktAuthenticator = require("./trakt/TraktAuthenticator");

    // Get access token
    const traktAuthenticator = new TraktAuthenticator(
      TRAKT_CLIENT_ID,
      TRAKT_CLIENT_SECRET
    );
    const accessToken = await traktAuthenticator.getSavedAccessCode();

    // Save movies
    if (accessToken) {
      // Construct objects
      const moviesDB = new MoviesDB();
      const traktAPI = new TraktAPI(TRAKT_CLIENT_ID);
      const moviesService = new MoviesService(MOVIES_SOURCE_URL, TMDB_API_KEY);

      // Create Movies table
      await moviesDB.createMoviesTableIfNotExists();

      // Get titles
      console.log("Getting titles currently on Netflix...");
      const titles = await moviesService.getTitlesOnNetflix();
      console.log(titles.length + " titles found!");

      // Find TMDB id
      console.log("Getting the TMDB id of each title...");
      const tmdbIds = await moviesService.getTmdbIdsByTitles(titles);
      const missing = titles.length - tmdbIds.length;
      console.log(
        tmdbIds.length +
          " id found! We could not find the id of " +
          missing +
          " titles."
      );

      // Add to Trakt playlist
      console.log("Adding movies to the Trakt playlist...");
      const addResult = await traktAPI.addMoviesBytmdbIds(
        tmdbIds,
        accessToken,
        TRAKT_USERNAME,
        TRAKT_LIST
      );

      console.log(
        `Added ${addResult.added.movies} movies to the existing ${addResult.existing.movies}; we were unable to find ${addResult.not_found.movies.length} movies`
      );

      // Update description
      console.log("Updating list description...");
      const now = new Date();
      
      const description = `**Automated** Trakt list of movies that have been on Netflix.
      In this list there are also the movies which are no longer on Netflix, starting from 28 August 2020.
      Based on https://github.com/paolobasso99/trakt-netflix-movies-list
      Last update: ${now.getDate()} ${now.toLocaleString("en-GB", {
        month: "long",
      })} ${now.getFullYear()}`;

      await traktAPI.updateListDescription(
        accessToken,
        TRAKT_USERNAME,
        TRAKT_LIST,
        description
      );

      if (HEALTHCHECKS_URL) {
        await axios.get(HEALTHCHECKS_URL);
      }

      console.log("Done!");
    } else {
      console.error(
        "Trakt's user has not been authenticated, use the 'auth' comand"
      );
    }
  }
};
