import {RequestResponse, RPCService} from "ts-rpc-http/requestResponse";

export interface createTodoRequest {
  description: string;
}

export interface createTodoAsyncRequest extends createTodoRequest {}

export interface Todo {
  id: string;
  description: string;
  dateCreated: Date;
}

export interface ServiceDefinition extends RPCService<"Todo"> {
  createTodo: RequestResponse<createTodoRequest, Todo>;
  createTodoAsync: RequestResponse<createTodoAsyncRequest, Todo>;
}
