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
   * Return the id if found, false if no movie is found.
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
            'Content-Type': 'application/json',
          },
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
            'Content-Type': 'application/json',
          },
          params: {
            api_key: this.tmdbApiKey,
            external_source: 'imdb_id',
          },
        }
      );

      if (response.data.movie_results.length > 0) {
        return response.data.movie_results[0].id;
      } else {
        return false;
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Request an auth token.
   * See https://developers.themoviedb.org/3/authentication/create-request-token for reference.
   *
   * @returns {(string|boolean)} The token or false if there is an error.
   */
  async authToken() {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/authentication/token/new`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          params: {
            api_key: this.tmdbApiKey,
          },
        }
      );

      if (response.data.success) {
        return response.data.request_token;
      } else {
        return false;
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Request an auth session.
   * See https://developers.themoviedb.org/3/authentication/create-session for reference.
   *
   * @returns {(string|boolean)} The session id or false if there is an error.
   */
  async authSesion(requestToken) {
    try {
      const response = await axios.post(
        `https://api.themoviedb.org/3/authentication/session/new`,
        {
          request_token: requestToken,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          params: {
            api_key: this.tmdbApiKey,
          },
        }
      );

      if (response.data && response.data.success) {
        return response.data.session_id;
      } else {
        return false;
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Add the movie to the list.
   *
   * @param {string} sessionId The session id.
   * @param {string} movieId The movieTMDB id.
   * @param {number} list The list.
   */
  async addMovieToList(sessionId, movieId, list) {
    try {
      const response = await axios.post(
        `https://api.themoviedb.org/3/list/${list}/add_item`,
        {
          media_id: movieId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          params: {
            api_key: this.tmdbApiKey,
            session_id: sessionId,
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Update the description of a list.
   *
   * @param {string} accessToken The access token.
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
            'Content-Type': 'application/json',
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
   * @param {string} accessToken The access token.
   * @param {Array<number>} ids The TMDB ids of the movies.
   * @param {string} list TMDB list id.
   * @returns {boolean} If it was successful.
   */
  async addMoviesToList(accessToken, ids, list) {
    // Transform ids to movie objects
    const movies = ids.map((id) => {
      return {
        "media_type": "movie",
        "media_id": id,
      }
    })

    // Add them
    try {
      const response = await axios.put(
        `https://api.themoviedb.org/4/list/${list}/items`,
        {
          "items": movies,
        },
        {
          headers: {
            'Content-Type': 'application/json',
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
}

module.exports = TmdbApi;
