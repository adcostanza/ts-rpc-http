import { TodoClient } from './clients';

const client = new TodoClient('http://localhost:5001');

client
  .createTodo({ description: 'Eat a taco' })
  .then(r => console.log(r))
  .catch(r => console.log(r.message));
