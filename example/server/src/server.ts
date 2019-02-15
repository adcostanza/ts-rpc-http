import { ServiceDefinition } from './models';
import { Server } from 'ts-rpc-http/server';

const server = new Server<ServiceDefinition>();

server.rpc('createTodo', (req, res) => {
  return res.status(200).send({
    id: 'random-id',
    dateCreated: new Date(),
    description: req.body.description,
  });
});
