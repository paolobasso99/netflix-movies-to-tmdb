require('dotenv').config();
process.env.NODE_ENV = 'test';
const { assert } = require('chai');

const { MOVIES_SOURCE_URL, TMDB_API_KEY } = process.env;

const MoviesService = require('../src/movies/MoviesService');
const MoviesDB = require('../src/movies/MoviesDB');
const moviesService = new MoviesService(TMDB_API_KEY);

const moviesDB = new MoviesDB();

describe('MovieService: getTitlesOnNetflix', () => {
  it('should return a non empty array', async () => {
    const movies = await moviesService.getTitlesOnNetflix(MOVIES_SOURCE_URL);

    assert.isArray(movies);
    assert.isAtLeast(movies.length, 1);
  });
});

describe('MovieService: getTmdbIdByTitle', () => {
  it('should return the correct id', async () => {
    const title = await moviesService.getTmdbIdByTitle('The Hateful Eight');
    const colon = await moviesService.getTmdbIdByTitle(
      'The Hateful Eight: this wil get removed aaaaaaa'
    );
    const parentheses = await moviesService.getTmdbIdByTitle(
      'The Hateful Eight (this wil get removed aaaaaaa)'
    );

    assert.equal(title, 273248);
    assert.equal(colon, 273248);
    assert.equal(parentheses, 273248);
  });

  it('should return false for fake movie', async () => {
    const title = await moviesService.getTmdbIdByTitle('fjkabsdkjflk');
    const colon = await moviesService.getTmdbIdByTitle(
      'fjkabsdkjflk: this wil get removed aaaaaaa'
    );
    const parentheses = await moviesService.getTmdbIdByTitle(
      'fjkabsdkjflk (this wil get removed aaaaaaa)'
    );

    assert.equal(title, false);
    assert.equal(colon, false);
    assert.equal(parentheses, false);
  });
});

describe('MovieService: getTmdbIdsByTitles', () => {
  it('should return the correct id', async () => {
    const ids = await moviesService.getTmdbIdsByTitles([
      'The Hateful Eight',
      'Pulp Fiction',
      'vjhkdfajfdjsabfhjbsdf',
    ]);

    assert.isArray(ids);
    assert.lengthOf(ids, 2);
    assert.include(ids, 680);
    assert.include(ids, 273248);
  });
});

describe('MovieService: searched movies should be in the database now', () => {
  it('should return the correct id', async () => {
    await moviesService.getTmdbIdsByTitles([
      'The Hateful Eight',
      'Pulp Fiction',
      'vjhkdfajfdjsabfhjbsdf',
    ]);

    const id1 = await moviesDB.getMovieIdByTitle('The Hateful Eight');
    const id2 = await moviesDB.getMovieIdByTitle('Pulp Fiction');
    const id3 = await moviesDB.getMovieIdByTitle('vjhkdfajfdjsabfhjbsdf');

    assert.equal(id1, 273248);
    assert.equal(id2, 680);
    assert.equal(id3, false);
  });
});
