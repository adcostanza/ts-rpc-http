# Typesafe HTTP JSON RPC API with TypeScript

This small set of utility makes it very easy to create an RPC API that is definined completely in TypeScript along with a generated client and optional automated api validation.

## Model

It all starts with a model file, where you define all of your basic data model types and one or more service definitions with this comment tagging them on the line above `//@http-rpc(<serviceName>)`. Here is a simple example:

```
import { RequestResponse } from 'ts-rpc-http/requestResponse';

export interface createTodoRequest {
  description: string;
}

export interface Todo {
  id: string;
  description: string;
  dateCreated: Date;
}

//@http-rpc(Todo)
export interface ServiceDefinition {
  createTodo: RequestResponse<createTodoRequest, Todo>;
  createTodoAsync: RequestResponse<createTodoRequest, Todo>;
}
```

## Server

It is a small wrapper around express that provides typing of the request body that is sent in JSON. It also provides optional automatic validation through use of generated JSONSchemas.

If you want to generate JSONSchema files for automatic validation, go ahead and run this command:

```
npx ts-generate --model src/models.ts --schemas
```

Where `src/models.ts` is the location of your models file. A directory called `schema` will be created and schema files will be created for each req/res import of your service.

Now we can create an example service:

```
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
    id: 'random-id',
    dateCreated: new Date(),
    description,
  });
});

server.rpc('createTodo', (req, res) => {
  res.status(200).send({
    id: 'random-id',
    dateCreated: new Date(),
    description: req.body.description,
  });
});

server
  .start()
  //no need to log this as it is done by the server automatically with the port
  .then(r => console.log('Started server...'))
  .catch(e => new Error(e));
```

## Client

The client is completely generated so it makes it extremely easy to use in your front end. All you need to do is copy the same models to your frontend and you can generate it there, or generate it with the server and provide it as a library.
