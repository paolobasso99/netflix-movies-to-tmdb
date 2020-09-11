const axios = require('axios');

/**
 * @class TmdbApi wraps TMDB API.
 */
class TmdbApi {
  /**
   * Creates a wrapper for TMDB API.
   *
   * @param {strig} tmdbApiKey API key of TMDB
   * @returns {TmdbApi} The instance
   */
  constructor(tmdbApiKey) {
    this.tmdbApiKey = tmdbApiKey;
  }

  /**
   * Search the id of the movie by the given query.
   *
   * @param {string} query The query to search the id by.
   * @returns {(boolean|number)} The id of the movie or false if no movie is found
   */
  async searchMovieId(query) {
    try {
      const response = await axios.get(
        'https://api.themoviedb.org/4/search/movie',
        {
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
            Authorization: 'Bearer ' + this.tmdbApiKey,
          },
          params: {
            query: query,
            include_adult: true,
          },
        }
      );

      if (response.data && response.data.results.length > 0) {
        return response.data.results[0].id;
      } else {
        return false;
      }
    } catch (error) {
      console.error(error);
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
    if (title) {
      // Search by raw title
      let id = await this.searchMovieId(title);
      if (id) return id;

      // Search by title removing content in parentheses
      if (title.includes('(') && title.includes(')')) {
        id = await this.searchMovieId(title.replace(/ *\([^)]*\) */g, ''));
        if (id) return id;
      }

      // Search by title removing content after a colon
      if (title.includes(':')) {
        id = await this.searchMovieId(title.split(':')[0]);
        if (id) return id;
      }
    }

    return false;
  }

  /**
   * Get the TMDB id from a IMDB id.
   *
   * @param {string} imdbId IMDB id; ex. tt0123456.
   * @returns {(number|boolean)} The TMDB id or false if no movie is found.
   */
  async getTmdbIdbyImdbId(imdbId) {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/find/${imdbId}`,
        {
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
            Authorization: 'Bearer ' + this.tmdbApiKey,
          },
          params: {
            external_source: 'imdb_id',
          },
        }
      );

      if (response.data && response.data.movie_results.length > 0) {
        return response.data.movie_results[0].id;
      } else {
        return false;
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Request an auth request_token.
   * See https://developers.themoviedb.org/4/auth/create-request-token for reference.
   *
   * @returns {(string|boolean)} The request_token or false if there is an error.
   */
  async requestToken() {
    try {
      const response = await axios.post(
        `https://api.themoviedb.org/4/auth/request_token`,
        '',
        {
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
            Authorization: 'Bearer ' + this.tmdbApiKey,
          },
        }
      );

      if (response.data && response.data.success) {
        return response.data.request_token;
      } else {
        return false;
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Request an auth access_token.
   * See https://developers.themoviedb.org/3/authentication/create-session for reference.
   *
   * @returns {(string|boolean)} The access_token or false if there is an error.
   */
  async accessToken(requestToken) {
    try {
      const response = await axios.post(
        'https://api.themoviedb.org/4/auth/access_token',
        {
          request_token: requestToken,
        },
        {
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
            Authorization: 'Bearer ' + this.tmdbApiKey,
          },
        }
      );

      if (response.data && response.data.success) {
        return response.data.access_token;
      } else {
        return false;
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Update the description of a list.
   *
   * @param {string} accessToken The access_token.
   * @param {number} list TMDB list id.
   * @param {string} description The new description
   * @returns {boolean} If the update was successful.
   */
  async updateListDescription(accessToken, list, description) {
    try {
      const response = await axios.put(
        `https://api.themoviedb.org/4/list/${list}`,
        {
          description: description,
        },
        {
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
            Authorization: 'Bearer ' + accessToken,
          },
        }
      );

      if (response.data) {
        return response.data.success;
      }
    } catch (error) {
      console.error(error);
    }

    return false;
  }

  /**
   * Add multiple movies to a list.
   *
   * @param {string} accessToken The access_token.
   * @param {Array<number>} ids The TMDB ids of the movies.
   * @param {string} list TMDB list id.
   * @returns {boolean} If it was successful.
   */
  async addMoviesToList(accessToken, ids, list) {
    // Transform ids to movie objects
    const movies = ids.map((id) => {
      return {
        media_type: 'movie',
        media_id: id,
      };
    });

    // Add them
    try {
      const response = await axios.put(
        `https://api.themoviedb.org/4/list/${list}/items`,
        {
          items: movies,
        },
        {
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
            Authorization: 'Bearer ' + accessToken,
          },
        }
      );

      if (response.data) {
        return response.data.success;
      }
    } catch (error) {
      console.error(error);
    }

    return false;
  }

  /**
   * Get a list.
   *
   * @param {string} accessToken The access_token.
   * @param {string} list TMDB list id.
   * @returns {(boolean|object)} The list or false if no list is found.
   */
  async getList(accessToken, list) {
    // Add them
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/4/list/${list}`,
        {
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
            Authorization: 'Bearer ' + accessToken,
          },
        }
      );

      if (response.data && response.data.results.length > 0) {
        return response.data.results;
      }
    } catch (error) {
      console.error(error);
    }

    return false;
  }
}

module.exports = TmdbApi;
