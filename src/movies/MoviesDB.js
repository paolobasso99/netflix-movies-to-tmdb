/**
 * @class MovieDB wraps the movie SQLite database
 */
class MoviesDB {
  /**
   * Open the database connection.
   */
  async openDb() {
    const { open } = require('sqlite');
    const sqlite3 = require('sqlite3');

    // Path
    const appRoot = require('app-root-path');
    let dbPath = appRoot + '/movies.db';

    const env = process.env.NODE_ENV || 'development';
    if (env === 'test') {
      dbPath = appRoot + '/test.db';
    }

    // Connect
    return open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
  }

  /**
   * Create the 'movies' table if it does not exists.
   */
  async createMoviesTableIfNotExists() {
    try {
      const db = await this.openDb();

      const sql =
        'CREATE TABLE IF NOT EXISTS movies (tmdbId INTEGER UNIQUE, title TEXT)';

      const result = await db.exec(sql);

      // Close DB
      await db.close();
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Create the 'movies' table if it does not exists.
   *
   * @param {string} table The table name.
   * @returns {boolean} True if the table exists.
   */
  async tableExists(table) {
    try {
      const db = await this.openDb();

      const sql =
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?";

      const result = await db.get(sql, table);

      // Close DB
      await db.close();

      if (result.name === table) return true;
    } catch (error) {
      console.log(error);
    }

    return false;
  }

  /**
   * Get the movie id by title.
   *
   * @param {string} title The title of the movie.
   */
  async getMovieIdByTitle(title) {
    try {
      const db = await this.openDb();

      const sql = 'SELECT DISTINCT tmdbId FROM movies WHERE title = ?';

      const result = await db.get(sql, title.trim());

      // Close DB
      await db.close();
      if (result) return result.tmdbId;
    } catch (error) {
      console.log(error);
    }

    return false;
  }

  /**
   * Add a movie to the datatbase.
   *
   * @param {number} tmdbId
   * @param {string} title
   */
  async addMovie(tmdbId, title) {
    try {
      const db = await this.openDb();

      const sql = 'INSERT OR IGNORE INTO movies(tmdbId, title) VALUES (?, ?)';

      const result = await db.run(sql, [tmdbId, title.trim()]);

      await db.close();
      return result;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = MoviesDB;
