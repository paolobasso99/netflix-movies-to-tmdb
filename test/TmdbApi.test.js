require('dotenv').config();
process.env.NODE_ENV = 'test';
const { assert } = require('chai');

const { TMDB_API_KEY, TMDB_LIST } = process.env;

const TmdbApi = require('../src/movies/TmdbApi');
const tmdbApi = new TmdbApi(TMDB_API_KEY);

describe('TMDB API: searchMovieId', () => {
  it('should return the correct id', async () => {
    const tmdbId = await tmdbApi.searchMovieId('The Hateful Eight');

    assert.equal(tmdbId, 273248);
  });

  it('should return false for fake film', async () => {
    const tmdbId = await tmdbApi.searchMovieId('adgasg');

    assert.equal(tmdbId, false);
  });
});

describe('TMDB API: deepSearchMovieId', () => {
  it('should return the correct id', async () => {
    const conlon = await tmdbApi.deepSearchMovieId(
      'The Hateful Eight: this wil get removed aaaaaaa'
    );
    const parentheses = await tmdbApi.deepSearchMovieId(
      'The Hateful Eight (this wil get removed aaaaaaa)'
    );

    assert.equal(conlon, 273248);
    assert.equal(parentheses, 273248);
  });

  it('should return false for fake film', async () => {
    const conlon = await tmdbApi.searchMovieId('adgasg: 8aaaaa');
    const parentheses = await tmdbApi.searchMovieId('adgasg (8aaaaa)');

    assert.equal(conlon, false);
    assert.equal(parentheses, false);
  });
});

describe('TMDB API: getTmdbIdbyImdbId', () => {
  it('should return the correct id', async () => {
    const tmdbId = await tmdbApi.getTmdbIdbyImdbId('tt3460252');

    assert.equal(tmdbId, 273248);
  });

  it('should return false for fake film', async () => {
    const tmdbId = await tmdbApi.searchMovieId('adgasg');

    assert.equal(tmdbId, false);
  });
});

describe('TMDB API: requestToken', () => {
  it('should return a request_token', async () => {
    const token = await tmdbApi.requestToken();

    assert.isString(token);
    assert.isAtLeast(token.length, 2);
  });
});

describe('TMDB API: getMoviesIdsInList', () => {
  it('should return an array', async () => {
    const ids = await tmdbApi.getMoviesIdsInList(TMDB_LIST);

    assert.isArray(ids);
  });
});
