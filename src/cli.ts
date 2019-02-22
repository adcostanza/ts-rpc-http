const program = require("commander");
import { generate } from "./generator";

program
  .version("0.0.37")
  .allowUnknownOption()
  .option("--model <model>", "Specify model file (required)")
  .option(
    "--clients <clients>",
    "The file for the generated clients in the same directory as the models"
  )
  .option("--schemas", "Generate json schemas") //TODO make folder selectable
  .parse(process.argv);

if (program.model == null || program.model == "") {
  throw Error("--model is required, try ts-generate --help for a full list of options");
}

if ((program.clients == null || program.clients == "") && !program.schemas) {
  throw Error("--client or --schemas is required, try ts-generate --help for a full list of options");
}

generate(program)
  .then(r => console.log("Code generation complete!"))
  .catch(e => new Error(e));
