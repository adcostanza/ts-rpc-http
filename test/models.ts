import {RequestResponse} from '../src/requestResponse';

export interface createTodoRequest {
    description: string;
}

export interface createTodoAsyncRequest extends createTodoRequest {
}

export interface Todo {
    id: string;
    description: string;
    dateCreated: Date;
}

//@http-rpc(Todo)
export interface ServiceDefinition {
    createTodo: RequestResponse<createTodoRequest, Todo>;
    createTodoAsync: RequestResponse<createTodoAsyncRequest, Todo>;
}
