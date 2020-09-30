# netflix-movies-to-tmdb
Script that pushes movies on Netflix to a TMDB playlist. [This](https://www.themoviedb.org/list/7057042) is the result.

## Why
I wanted to have a TMDB playlist of movies which have been on Netflix in order to *\*cough\** buy them automatically using TMDB APIs.

## What did I learn?
I may over engineered this simple task but this project has been an excuse to learn:
1. [JSDoc](https://jsdoc.app/): finally a standard documentation that does not sucks!
2. [Mocha](https://mochajs.org/) and [Chai](https://www.chaijs.com/) to unit test this app
3. OAuth API authentication and [TMDB APIs](https://developers.themoviedb.org/3/getting-started/introduction)
4. GitHub Actions to continuously test and deploy this script
5. [yargs](https://github.com/yargs/yargs) to build CLI apps with JavaScript
6. SQLite as a database for simple projects
7. [ESLint](https://eslint.org/) to keep the code pretty

## Setup
1. Clone the repository
2. Install dependecies with `npm i`
3. Copy `.env.example` to `.env`
4. Edit your envirorment variables
5. Authenticate your TMDB account with `npm run auth`
6. Push movies to the playlist with `npm run start`
7. Create a cron job to update the playlist periodically

## Movie source
You must build/find a JSON source with an array of objects that contains a `title` parameter.

## Unmatched titles
You can use `npm run add [id] [title]` to match a TMDB id to a title. Be sure the movie's title is the same you will found in your source json, this way the app won't try to match it again.
