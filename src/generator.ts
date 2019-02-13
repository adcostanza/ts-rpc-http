import * as fs from 'fs';
import * as handlebars from 'handlebars';
import * as _ from 'lodash';
const path = require('path');
//check for args
if (process.argv.length <= 3) {
  console.log('Usage: generate <models file> <generated filename>');
  console.log('Example: generate ./src/models.ts clients');
  process.exit(-1);
}

const modelsLocation = process.argv[2];
const generatedName = process.argv[3];

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

const split1 = modelsLocation.split('/');
const folder = split1.slice(0, split1.length - 1).join('/');
const data = fs.readFileSync(modelsLocation, 'utf-8');
const lines = data.split('\n');
let onDefinition = false;

let accumulatedLines = ''; //can accumulate across newlines
interface Service {
  serviceName: string;
  serviceDefinitionName: string;
  routes: { routeName: string; request: string; response: string }[];
}

type TemplateMap = Record<string, Service>;
const templateMap: TemplateMap = {};

let current = '';
for (let line of lines) {
  //recognize special comment
  if (line.trim().indexOf('//@http-rpc') > -1) {
    onDefinition = true;
    current = leftOf(')', rightOf('//@http-rpc(', line));
    templateMap[current] = {
      serviceName: current,
      serviceDefinitionName: '',
      routes: [],
    };
    continue;
  }

  //skip lines with left side comments
  if (leftOf('//', line) == '') {
    continue;
  } else {
    //ignore right side comments
    line = leftOf('//', line);
  }

  if (!onDefinition) {
    continue;
  }

  if (line.trim() === '}') {
    //end
    onDefinition = false;
    continue;
  }

  if (line.trim().indexOf('export') > -1) {
    const serviceDefinitionName = leftOf('{', rightOf('interface', line)).trim();

    templateMap[current] = { ...templateMap[current], serviceDefinitionName };
    continue;
  }

  //req/res definition, will search for ; to find full line
  accumulatedLines += line;
  if (line.indexOf(';') >= 0) {
    const routeName = leftOf(':', accumulatedLines);
    const reqRes = rightOf(':', accumulatedLines);
    const request = leftOf(',', rightOf('RequestResponse<', reqRes));

    const response = leftOf('>', rightOf(',', rightOf('RequestResponse<', reqRes)));

    //reset accumulatedLines
    accumulatedLines = '';

    templateMap[current].routes.push({ routeName, request, response });
  }
}

const imports = _.uniq(
  _.flattenDeep(
    _.values(templateMap).map(service => {
      return [
        service.serviceDefinitionName,
        ...service.routes.map(route => [route.request, route.response]),
      ];
    })
  )
);

console.log(imports);

const templateText = fs.readFileSync(
  path.resolve(__dirname, 'template.handlebars'),
  'utf-8'
);
const template = handlebars.compile(templateText);
const generated = template({ services: templateMap, imports });
const generatePath = folder + '/' + generatedName;

fs.writeFile(generatePath, generated, err => {
  console.log(err || 'success');
});

//now let's also generate json schemas

console.log('Generating JSON schemas...');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

var deleteFolderRecursive = function(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file, index) {
      var curPath = path + '/' + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

const makeSchemaDirectory = () => fs.mkdirSync(`${folder}/schema`);
try {
  makeSchemaDirectory();
} catch (e) {
  deleteFolderRecursive(`${folder}/schema`);
  makeSchemaDirectory();
}

async function generateSchema(type: string) {
  const cmd = `npx typescript-json-schema ${modelsLocation} ${type} --required --topRef -o ${folder}/schema/${type}.json`;
  console.log('Running command');
  console.log(cmd);
  const { stdout, stderr } = await exec(cmd);
  if (stderr != "") {
    console.log(stderr);
  }
}

imports.forEach(current => {
  generateSchema(current)
    .then()
    .catch(console.log);
});
