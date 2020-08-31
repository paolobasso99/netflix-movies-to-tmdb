const axios = require("axios");

/**
 * @class TmdbApi wraps TMDB API.
 */
class TmdbApi {
  /**
   * Creates a wrapper for TMDB API.
   *
   * @param {strig} tmdbApiKey API key of TMDB
   */
  constructor(tmdbApiKey) {
    this.tmdbApiKey = tmdbApiKey;
  }

  /**
   * Search the id of the movie by the given query.
   * Return the id if found, false if no movie is found.
   *
   * @param {string} query The query to search the id by.
   * @returns {(boolean|number)} The id of the movie or false if no movie is found
   */
  async searchMovieId(query) {
    const response = await axios.get(
      "https://api.themoviedb.org/3/search/movie",
      {
        params: {
          api_key: this.tmdbApiKey,
          query: query,
          include_adult: true,
        },
      }
    );

    if (response.data.results.length > 0) {
      return response.data.results[0].id;
    } else {
      return false;
    }
  }

  /**
   * Search the movie id by title.
   * Perform a search with the raw title then, if needed, with the title
   * without text in parentheses and text after a colon.
   *
   * @param {string} title The title of the movie
   * @returns {(boolean|number)} The id of the movie or false if no movie is found
   */
  async deepSearchMovieId(title) {
    // Search by raw title
    let id = await this.searchMovieId(title);
    if (id) return id;

    // Search by title removing content in parentheses
    if (title.includes("(") && title.includes(")")) {
      id = await this.searchMovieId(title.replace(/ *\([^)]*\) */g, ""));
      if (id) return id;
    }

    // Search by title removing content after a colon
    if (title.includes(":")) {
      id = await this.searchMovieId(title.split(":")[0]);
      if (id) return id;
    }

    return false;
  }
}

module.exports = TmdbApi;
