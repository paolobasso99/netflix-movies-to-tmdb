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
   * @returns {(string|boolean)} The session id or false if error.
   */
  async start() {
    try {
      console.log('Requesting token...');
      const authToken = await this.tmdbApi.authToken();

      if (authToken) {
        console.log(
          'Visit: https://www.themoviedb.org/authenticate/' + authToken
        );

        await this.askQuestion(
          'Did you validate the token? Press any key to continue...'
        );

        const sessionId = await this.tmdbApi.authSesion(authToken);

        if (sessionId) {
          console.log('Saving session id...');
          this.storeSessionId(sessionId);
          console.log('Session id saved!');
        }

        return sessionId;
      }
    } catch (error) {
      console.error(error);
    }

    return false;
  }

  /**
   * Store a session id as json.
   *
   * @param {string} sessionId The session id.
   */
  async storeSessionId(sessionId) {
    if (sessionId) {
      const fs = require('fs');
      const appRoot = require('app-root-path');

      const data = {
        sessionId: sessionId,
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
   * Get the stored session id.
   *
   * @returns {(string|boolean)} The session id or false if no session id is found.
   */
  async getStoredSessionId() {
    const readFile = util.promisify(fs.readFile);

    try {
      const data = await readFile('tmdb.json');
      const { sessionId } = JSON.parse(data);

      return sessionId;
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
