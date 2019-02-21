import { ServiceDefinition } from './../../example/server/src/models';
import { Server } from '../../src/server';

const path = require('path');

describe('server unit test', () => {
  test('starts and stops', async () => {
    const server = new Server<ServiceDefinition>();
    await server.start();
    await server.close();
  });
});
