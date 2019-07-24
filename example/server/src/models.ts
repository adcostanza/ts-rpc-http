import { RequestResponse } from "ts-rpc-http/requestResponse";

export interface createTodoRequest {
  description: string;
}

export interface createTodoAsyncRequest extends createTodoRequest {}
b 
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
