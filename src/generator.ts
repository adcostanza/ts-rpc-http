import * as fs from "fs";
import * as handlebars from "handlebars";
import * as _ from "lodash";

const util = require("util");
const exec = util.promisify(require("child_process").exec);
const path = require("path");

export interface ProgramInterface {
  model: string;
  clients?: string;
  schemas?: boolean;
}

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
    if (program.model == null || program.model == "") {
      reject("--model is required");
    }

    const modelsLocation = program.model;
    const generatedName = program.clients;

    console.log(modelsLocation, generatedName);

    /**
     * returns the right side of the first occurence of the needle in the haystack
     * @param needle the string to find
     * @param haystack the string to find the needle in
     */
    const rightOf = (needle: string, haystack: string): string => {
      return haystack
        .trim()
        .split(needle)[1]
        .trim();
    };

    /**
     * returns the left side of the first occurence of the needle in the haystack
     * @param needle the string to find
     * @param haystack the string to find the needle in
     */
    const leftOf = (needle: string, haystack: string): string => {
      return haystack
        .trim()
        .split(needle)[0]
        .trim();
    };

    if ((program.clients != null && program.clients != "") || program.schemas) {
      const folder = path.resolve(modelsLocation, "..");
      const data = fs.readFileSync(modelsLocation, "utf-8");
      const lines = data.split("\n");
      let onDefinition = false;

      let accumulatedLines = ""; //can accumulate across newlines
      interface Service {
        serviceName: string;
        serviceDefinitionName: string;
        routes: { routeName: string; request: string; response: string }[];
      }

      type TemplateMap = Record<string, Service>;
      const templateMap: TemplateMap = {};

      let current = "";
      for (let line of lines) {
        //recognize special comment
        if (line.trim().indexOf("//@http-rpc") > -1) {
          onDefinition = true;
          current = leftOf(")", rightOf("//@http-rpc(", line));
          templateMap[current] = {
            serviceName: current,
            serviceDefinitionName: "",
            routes: []
          };
          continue;
        }

        //skip lines with left side comments
        if (leftOf("//", line) == "") {
          continue;
        } else {
          //ignore right side comments
          line = leftOf("//", line);
        }

        if (!onDefinition) {
          continue;
        }

        if (line.trim() === "}") {
          //end
          onDefinition = false;
          continue;
        }

        if (line.trim().indexOf("export") > -1) {
          const serviceDefinitionName = leftOf(
            "{",
            rightOf("interface", line)
          ).trim();

          templateMap[current] = {
            ...templateMap[current],
            serviceDefinitionName
          };
          continue;
        }

        //req/res definition, will search for ; to find full line
        accumulatedLines += line;
        if (line.indexOf(";") >= 0) {
          const routeName = leftOf(":", accumulatedLines);
          const reqRes = rightOf(":", accumulatedLines);
          const request = leftOf(",", rightOf("RequestResponse<", reqRes));

          const response = leftOf(
            ">",
            rightOf(",", rightOf("RequestResponse<", reqRes))
          );

          //reset accumulatedLines
          accumulatedLines = "";

          templateMap[current].routes.push({ routeName, request, response });
        }
      }

      const imports = _.uniq(
        _.flattenDeep(
          _.values(templateMap).map(service => {
            return [
              service.serviceDefinitionName,
              ...service.routes.map(route => [route.request, route.response])
            ];
          })
        )
      );

      if (program.clients != null && program.clients != "") {
        console.log(imports);

        const templateText = fs.readFileSync(
          path.resolve(__dirname, "template.handlebars"),
          "utf-8"
        );
        const template = handlebars.compile(templateText);
        const generated = template({ services: templateMap, imports });
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
        generateJSONSchemas(imports, modelsLocation, folder)
          .then(r => resolve())
          .catch(reject);
      }
    }
  });
};
