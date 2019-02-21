const util = require('util');
const exec = util.promisify(require('child_process').exec);
import * as fs from 'fs';

describe("generator", () => {
    test("generate schemas", async () => {
        //schema generation can take a long time
        jest.setTimeout(30000);
        const cmd = "npx ts-node src/generator.ts --model test/integration/generation/models.ts --schemas";
        const {stdout, stderr} = await exec(cmd);
        if (stderr != '') {
            console.log(stderr);
        }

        const files = fs.readdirSync('test/integration/generation/schema');
        expect(files).toEqual(
            ['ServiceDefinition.json',
                'Todo.json',
                'createTodoRequest.json']);
    });
});