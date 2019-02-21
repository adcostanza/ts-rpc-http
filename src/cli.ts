const program = require("commander");
import {generate} from "./generator";

program
    .version("0.0.20")
    .allowUnknownOption()
    .option("--model <model>", "Specify model file")
    .option(
        "--clients <clients>",
        "The file for the generated clients in the same directory as the models"
    )
    .option("--schemas", "Generate json schemas") //TODO make folder selectable
    .parse(process.argv);

generate(program)
    .then(console.log)
    .catch(e => new Error(e));
