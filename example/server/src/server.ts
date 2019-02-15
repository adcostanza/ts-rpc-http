import { ServiceDefinition } from './models';
import { Server } from 'ts-rpc-http/server';

const server = new Server<ServiceDefinition>();

server.rpc('createTodo', async (req, res) => {
  //do some async stuff
  const description: string = await new Promise((resolve, reject) => {
    return resolve('promise description' + req.body.description);
  });

  res.status(200).send({
    id: 'random-id',
    dateCreated: new Date(),
    description,
  });
});

server
  .start()
  .then(r => console.log('Started server...'))
  .catch(e => new Error(e));
