const axios = require('axios');
const MoviesDB = require('./movies/MoviesDB');
const TmdbApi = require('./movies/TmdbApi');
const TmdbAuthenticator = require('./movies/TmdbAuthenticator');

const { NODE_ENV, TMDB_API_KEY, TMDB_LIST } = process.env;
/**
 * @class Commands class.
 */
class Commands {
  /**
   * Add a movie to the database and to the TMDB list mannualy.
   *
   * @param {(number|string)} id TMDB or IMDB id of the movie.
   * @param {string} title The title of the movie
   */
  static async add(id, title) {
    const tmdbApi = new TmdbApi(TMDB_API_KEY);

    // If IMDB id is provided transfor to TMDB id
    if (typeof id === 'string' && id.startsWith('tt')) {
      console.log('Transforming IMDB id to a TMDB id...');
      try {
        id = await tmdbApi.getTmdbIdbyImdbId(id);

        if (!id) {
          throw 'Unable to find the TMDB id of this IMDB id!';
        }
      } catch (error) {
        console.error(error);
      }
    }

    if (id) {
      const moviesDB = new MoviesDB();

      // Add movie to DB
      console.log('Adding movie to the database...');
      try {
        await moviesDB.createMoviesTableIfNotExists();
        await moviesDB.addMovie(id, title);
        console.log('Movie added to the database!');
      } catch (error) {
        console.error(error);
      }

      // Add to TMDB list
      console.log('Adding movie to the list...');
      const tmdbAuthenticator = new TmdbAuthenticator(TMDB_API_KEY);
      const accessToken = await tmdbAuthenticator.getStoredAccessToken();

      if (accessToken) {
        await tmdbApi.addMoviesToList(accessToken, [id], TMDB_LIST);
      } else {
        throw "There was an error with TMDB authentication. Try the 'auth' command again.";
      }
      console.log('Done!');
    }
  }

  /**
   * Command to start the TMDB authentication process.
   */
  static async auth() {
    const tmdbAuthenticator = new TmdbAuthenticator(TMDB_API_KEY);

    try {
      await tmdbAuthenticator.start();
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Command to add the movies currently on Netflix to the TMDB list.
   */
  static async start() {
    const MoviesService = require('./movies/MoviesService');
    const { MOVIES_SOURCE_URL, HEALTHCHECKS_URL } = process.env;

    if (HEALTHCHECKS_URL) {
      await axios.get(HEALTHCHECKS_URL + '/start');
    }

    // Get session id
    const tmdbAuthenticator = new TmdbAuthenticator(TMDB_API_KEY);
    const accessToken = await tmdbAuthenticator.getStoredAccessToken();

    // Save movies
    if (accessToken) {
      // Construct objects
      const moviesDB = new MoviesDB();
      const tmdbApi = new TmdbApi(TMDB_API_KEY);
      const moviesService = new MoviesService(TMDB_API_KEY);

      // Get titles
      console.log('Getting titles currently on Netflix...');

      const {
        PROXY_ENABLED,
        PROXY_HOST,
        PROXY_PORT,
        PROXY_USERNAME,
        PROXY_PASSWORD,
      } = process.env;

      let titles = [];

      if (PROXY_ENABLED) {
        titles = await moviesService.getTitlesOnNetflix(
          MOVIES_SOURCE_URL,
          PROXY_HOST,
          PROXY_PORT,
          PROXY_USERNAME,
          PROXY_PASSWORD
        );
      } else {
        titles = await moviesService.getTitlesOnNetflix(MOVIES_SOURCE_URL);
      }

      if (titles && titles.length > 0) {
        console.log(titles.length + ' titles found!');

        // Find TMDB id
        console.log('Getting the TMDB id of each title...');
        const ids = await moviesService.getTmdbIdsByTitles(titles);
        const missing = titles.length - ids.length;
        console.log(
          ids.length +
            ' id found! We could not find the id of ' +
            missing +
            ' titles.'
        );

        // Add to TMDB list
        console.log('Adding movies to the TMDB playlist...');
        const addResult = await tmdbApi.addMoviesToList(
          accessToken,
          ids,
          TMDB_LIST
        );

        if (addResult) {
          console.log(`Successfully added movies to the TMDB list`);

          // Update description
          console.log('Updating list description...');
          const now = new Date();

          const lastUpdate =
            now.getDate() +
            ' ' +
            now.toLocaleString('en-GB', { month: 'long' }) +
            ' ' +
            now.getFullYear();

          const description =
            '**Automated** TMDB list of movies that have been on Netflix.<br>Based on https://github.com/paolobasso99/netflix-movies-to-tmdb <br>Last update: ' +
            lastUpdate;

          const descriptionResult = await tmdbApi.updateListDescription(
            accessToken,
            TMDB_LIST,
            description
          );

          if (descriptionResult) {
            if (HEALTHCHECKS_URL) {
              await axios.get(HEALTHCHECKS_URL);
            }

            console.log('Done!');
          } else {
            console.error(
              'We were unable to update the description of the list!'
            );
          }
        }
      } else {
        console.error('No movies found in the provided source!');
      }
    } else {
      console.error(
        "TMDB's user has not been authenticated, use the 'auth' comand"
      );
    }
  }
}

module.exports = Commands;
