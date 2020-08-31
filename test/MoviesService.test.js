require('dotenv').config();
const { assert } = require('chai');

const { MOVIES_SOURCE_URL, TMDB_API_KEY } = process.env;

const MoviesService = require('../src/movies/MoviesService');
const moviesService = new MoviesService(TMDB_API_KEY);

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
      'vjhkdfajfdjsabfhjbsdf'
    ]);

    assert.isArray(ids);
    assert.lengthOf(ids, 2);
    assert.include(ids, 680);
    assert.include(ids, 273248);
  });
});
