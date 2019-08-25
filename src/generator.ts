import * as fs from "fs";
import * as handlebars from "handlebars";
import * as _ from "lodash";
import { extract } from "./extractor";

const util = require("util");
const exec = util.promisify(require("child_process").exec);
const path = require("path");

export interface ProgramInterface {
  model: string;
  clients?: string;
  schemas?: boolean;
}
export interface Route {
  routeName: string;
  request: string;
  response: string;
}

export interface Service {
  serviceName?: string;
  serviceDefinitionName?: string;
  routes: Route[];
}

export interface HandlebarsTemplate {
  services: Service[];
  imports: string[];
}
export type TemplateMap = Record<string, Service>;

const deleteFolderRecursive = function(_path) {
  if (fs.existsSync(_path)) {
    fs.readdirSync(_path).forEach(function(file, index) {
      let curPath = path.resolve(_path, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(_path);
  }
};

const generateSchema = async (
  type: string,
  modelsLocation: string,
  folder: string
) => {
  const schemaLocation = path.resolve(folder, "schema", `${type}.json`);
  const cmd = `npx typescript-json-schema ${modelsLocation} ${type} --required --topRef -o ${schemaLocation}`;
  console.log("Running command");
  console.log(cmd);
  const { stdout, stderr } = await exec(cmd);
  if (stderr != "") {
    console.log(stderr);
  }
};

const generateSchemas = async (
  types: string[],
  modelsLocation: string,
  folder: string
) => {
  await Promise.all(
    types.map(type => generateSchema(type, modelsLocation, folder))
  );
};

const generateJSONSchemas = async (
  types: string[],
  modelsLocation: string,
  folder: string
) => {
  console.log("Generating JSON schemas...");
  const makeSchemaDirectory = () =>
    fs.mkdirSync(path.resolve(folder, "schema"));
  try {
    makeSchemaDirectory();
  } catch (e) {
    deleteFolderRecursive(path.resolve(folder, "schema"));
    makeSchemaDirectory();
  }

  await generateSchemas(types, modelsLocation, folder);
};

export const generate = (program: ProgramInterface) => {
  return new Promise((resolve, reject) => {
    const modelsLocation = program.model;
    const generatedName = program.clients;

    if ((program.clients != null && program.clients != "") || program.schemas) {
      const folder = path.resolve(modelsLocation, "..");

      //TODO this really sucks :(
      const split = modelsLocation.split("/");
      const importLocation = split[split.length - 1].split(".")[0];
      const handlebarsData = {
        ...extract(path.resolve(process.cwd(), modelsLocation)),
        modelsLocation: importLocation
      };

      if (program.clients != null && program.clients != "") {
        const templateText = fs.readFileSync(
          path.resolve(__dirname, "template.handlebars"),
          "utf-8"
        );
        const template = handlebars.compile(templateText);
        const generated = template(handlebarsData);
        const generatePath = path.resolve(folder, generatedName);

        fs.writeFile(generatePath, generated, err => {
          console.log(err || "");
          if (!program.schemas) {
            resolve();
          }
        });
      }

      if (program.schemas) {
        //now let's also generate json schemas
        generateJSONSchemas(handlebarsData.imports, modelsLocation, folder)
          .then(r => resolve())
          .catch(reject);
      }
    }
  });
};
