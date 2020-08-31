require('dotenv').config();
process.env.NODE_ENV = 'test';
const { assert } = require('chai');

// Init test DB
const MoviesDB = require('../src/movies/MoviesDB');
const moviesDB = new MoviesDB();

describe('MoviesDB: createMoviesTableIfNotExists', () => {
  it('should create a new table', async () => {
    await moviesDB.createMoviesTableIfNotExists();
    const exists = await moviesDB.tableExists('movies');

    assert.isTrue(exists);
  });
});

describe('MoviesDB: add movie and then get it', () => {
  it('should return the correct id', async () => {
    await moviesDB.createMoviesTableIfNotExists();
    await moviesDB.addMovie(273248, 'The Hateful Eight');

    const id = await moviesDB.getMovieIdByTitle('The Hateful Eight');

    assert.equal(id, 273248);
  });
});
