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

const split1 = modelsLocation.split('/');
const folder = split1.slice(0, split1.length - 1).join('/');
const data = fs.readFileSync(modelsLocation, 'utf-8');
const lines = data.split('\n');
let onDefinition = false;
interface Service {
  serviceName: string;
  serviceDefinitionName: string;
  routes: { routeName: string; request: string; response: string }[];
}

type TemplateMap = Record<string, Service>;
const templateMap: TemplateMap = {};

let current = '';
for (let line of lines) {
  console.log(line);
  if (line.trim().indexOf('//@http-rpc') > -1) {
    onDefinition = true;
    current = line
      .trim()
      .split('//@http-rpc(')[1]
      .split(')')[0];
    templateMap[current] = {
      serviceName: current,
      serviceDefinitionName: '',
      routes: [],
    };
    continue;
  }
  if (!onDefinition) {
    continue;
  }

  if (line.trim() === '}') {
    //end
    onDefinition = false;
    continue;
  }
  //parse definition
  if (line.trim() === '}') {
    continue; //skip first line
  }

  if (line.trim().indexOf('export') > -1) {
    const serviceDefinitionName = line
      .trim()
      .split('interface')[1]
      .trim()
      .split('{')[0]
      .trim();

    templateMap[current] = { ...templateMap[current], serviceDefinitionName };
    continue;
  }

  const split = line.trim().split(':');
  //   console.log(split);
  const routeName = split[0];
  const reqRes = split[1];
  const request = reqRes
    .trim()
    .split('RequestResponse<')[1]
    .split(',')[0]
    .trim();
  const response = reqRes
    .trim()
    .split('RequestResponse<')[1]
    .split(',')[1]
    .split('>')[0]
    .trim();

  templateMap[current].routes.push({ routeName, request, response });
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
