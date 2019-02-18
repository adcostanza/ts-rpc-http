import { ServiceDefinition } from './models';
import { Server } from '../src/server';
import { TodoClient } from './clients';
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');

describe('the server', () => {
  let server;

  beforeAll(async () => {
    server = new Server<ServiceDefinition>(5001);
    server.rpc('createTodo', (req, res) => {
      res.status(200).send({ ...req.body, dateCreated: new Date(), id: 'random-id' });
    });
    await server.start();
  });

  afterAll(async () => {
    // process.exit(0);
    await server.close();
  });

  test('rpc methods are ran on startup', async () => {
    const client = new TodoClient('http://localhost:5001');
    const description = 'desc';
    const result = await client.createTodo({ description });
    expect(result.description).toEqual(description);
  });
});
