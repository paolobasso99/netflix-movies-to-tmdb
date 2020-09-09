const axios = require('axios');
const fs = require('fs');
const util = require('util');

const TmdbApi = require('./TmdbApi');

/**
 * @class TmdbApi wraps TMDB API.
 */
class TmdbAuthenticator {
  /**
   * Creates an TMDB authenticator instance.
   *
   * @param {strig} tmdbApiKey API key of TMDB
   * @returns {TmdbAuthenticator} The instance
   */
  constructor(tmdbApiKey) {
    this.tmdbApi = new TmdbApi(tmdbApiKey);
  }

  /**
   * Start the authentication process.
   *
   * @returns {(string|boolean)} The access_token or false if error.
   */
  async start() {
    try {
      console.log('Requesting token...');
      const requestToken = await this.tmdbApi.requestToken();

      if (requestToken) {
        console.log(
          'Visit: https://www.themoviedb.org/auth/access?request_token=' + requestToken
        );

        await this.askQuestion(
          'Did you validate the token? Press any key to continue...'
        );

        const accessToken = await this.tmdbApi.accessToken(requestToken);

        if (accessToken) {
          console.log('Saving access_token...');
          this.storeAccessToken(accessToken);
          console.log('access_token saved!');
        }

        return accessToken;
      }
    } catch (error) {
      console.error(error);
    }

    return false;
  }

  /**
   * Store a access_token as json in "@/tmdb.json".
   *
   * @param {string} sessionId The access_token.
   */
  async storeAccessToken(accessToken) {
    if (accessToken) {
      const fs = require('fs');
      const appRoot = require('app-root-path');

      const data = {
        accessToken: accessToken,
      };

      await fs.writeFile(
        appRoot + '/tmdb.json',
        JSON.stringify(data),
        'utf8',
        (err, data) => {
          if (err) throw err;
        }
      );
    }
  }

  /**
   * Get the stored access_token.
   *
   * @returns {(string|boolean)} The access_token or false if no access_token is found.
   */
  async getStoredAccessToken() {
    const readFile = util.promisify(fs.readFile);

    try {
      const data = await readFile('tmdb.json');
      const { accessToken } = JSON.parse(data);

      return accessToken;
    } catch (error) {
      console.error(error);
    }

    return false;
  }

  /**
   * Ask a console question.
   */
  askQuestion(query) {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) =>
      rl.question(query, (ans) => {
        rl.close();
        resolve(ans);
      })
    );
  }
}

module.exports = TmdbAuthenticator;
