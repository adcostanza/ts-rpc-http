import * as fs from 'fs';
import {generate} from "../../../src/generator";

describe("generator", () => {
    test("generate schemas", async () => {
        //schema generation can take a long time
        jest.setTimeout(30000);
        await generate({model: "test/integration/generation/models.ts", schemas: true});
        const files = fs.readdirSync('test/integration/generation/schema');
        expect(files).toEqual(
            ['ServiceDefinition.json',
                'Todo.json',
                'createTodoRequest.json']);
    });
});