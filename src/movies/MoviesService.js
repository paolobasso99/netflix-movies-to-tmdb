const axios = require('axios');
const MoviesDB = require('./MoviesDB');
const TmdbApi = require('./TmdbApi');

/**
 * @class Movies helper class.
 */
class MoviesService {
  /**
   * Create an instance of MoviesService.
   *
   * @param {string} tmdbApiKey TMDB API key.
   * @returns {MoviesService} The instance
   */
  constructor(tmdbApiKey) {
    this.tmdbApi = new TmdbApi(tmdbApiKey);
    this.moviesDB = new MoviesDB();
  }

  /**
   * Get the list of titles currenty on Netflix.
   *
   * @param {string} sourceURL
   * @returns {Array<string>} The array of titles.
   */
  async getTitlesOnNetflix(sourceURL) {
    try {
      const response = await axios.get(sourceURL);

      return response.data.map((movie) => {
        return movie.title.trim().replace("\\'", "'");
      });
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Get TMDB ids by an array of titles.
   *
   * @param {Array<string>} titles The array of titles.
   * @returns {Array<number>} The ids of the movies.
   */
  async getTmdbIdsByTitles(titles) {
    const tmdbIds = [];

    for (let title of titles) {
      const tmdbId = await this.getTmdbIdByTitle(title);
      if (tmdbId) {
        tmdbIds.push(tmdbId);
      }
    }

    return tmdbIds;
  }

  /**
   * Get a TMDB id by title.
   * This method first searches the database and then TMDB API.
   *
   * @param {string} title The title of the movie.
   * @returns {(string|boolean)} The id of the movie or false if no id is found.
   */
  async getTmdbIdByTitle(title) {
    await this.moviesDB.createMoviesTableIfNotExists();
    const tmdbId = await this.moviesDB.getMovieIdByTitle(title);

    if (tmdbId) {
      return tmdbId;
    } else {
      try {
        const result = await this.tmdbApi.deepSearchMovieId(title);

        if (result) {
          await this.moviesDB.addMovie(result, title);
          return result;
        }
      } catch (error) {
        console.error(error);
      }
    }

    return false
  }
}

module.exports = MoviesService;
