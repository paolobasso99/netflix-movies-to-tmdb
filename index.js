require("dotenv").config();
const Commands = require("./src/Commands");

const argv = require("yargs")
  .usage("$0 command")
  .command(
    "start",
    "add current movies on Netflix to the Trakt playlist",
    (argv) => Commands.start()
  )
  .command("auth", "start Trakt authentication process", (argv) =>
    Commands.auth()
  )
  .command(
    "add [id] [title]",
    "add a movie to the database and to the Trakt playlist",
    (yargs) => {
      yargs.positional("id", {
        describe: "the TMDB id or IMDB id of the movie",
      });

      yargs.positional("title", {
        describe: "the Netflix title of the movie",
      });
    },
    (argv) => Commands.add(argv.id, argv.title)
  )
  .demand(1, "must provide a valid command")
  .help("h")
  .alias("h", "help").argv;
