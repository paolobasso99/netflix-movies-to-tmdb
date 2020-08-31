require("dotenv").config();
const Commands = require("./src/Commands");

const argv = require("yargs")
  .usage("$0 command")
  .command(
    "start",
    "add current movies on Netflix to the TMDB playlist",
    (argv) => Commands.start()
  )
  .command("auth", "start TMDB authentication process", (argv) =>
    Commands.auth()
  )
  .command(
    "add [id] [title]",
    "add a movie to the database and to the TMDB playlist",
    (yargs) => {
      yargs.positional("id", {
        describe: "the TMDB id or IMDB id of the movie",
      });

      yargs.positional("title", {
        type: 'string',
        describe: "the Netflix title of the movie",
      });
    },
    (argv) => Commands.add(argv.id, argv.title)
  )
  .demand(1, "must provide a valid command")
  .help("h")
  .alias("h", "help").argv;
