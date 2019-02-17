import { ServiceDefinition } from './models';
import { Server } from 'ts-rpc-http/server';

const server = new Server<ServiceDefinition>();

//validate schemas per the schema folder (optional)
server.validateSchemas('/src/schema');

server.rpc('createTodoAsync', async (req, res) => {
  //do some async stuff
  const description: string = await new Promise((resolve, reject) => {
    return resolve('promise description' + req.body.description);
  });

  res.status(200).send({
    id: 'taco',
    dateCreated: new Date(),
    description,
  });
});

server.rpc('createTodo', (req, res) => {
  return res.status(200).send({
    id: 'taco',
    dateCreated: new Date(),
    description: req.body.description,
  });
});


server
  .start()
  .then(r => console.log('Started server...'))
  .catch(e => new Error(e));
