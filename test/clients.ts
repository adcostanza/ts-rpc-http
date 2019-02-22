import Client from '../src/client';
import {
    ServiceDefinition,
    createTodoRequest,
    Todo,
} from './models';

export class TodoClient {
    private client: Client<ServiceDefinition>;

    constructor(baseURL: string) {
        this.client = new Client(baseURL);
    }

    public createTodo = async (
        body: createTodoRequest,
        token?: string
    ): Promise<Todo> => this.client.call('createTodo', body, token);

    public createTodoAsync = async (
        body: createTodoRequest,
        token?: string
    ): Promise<Todo> => this.client.call('createTodoAsync', body, token);

}
