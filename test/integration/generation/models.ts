import {RequestResponse, RPCService} from "../../../src/requestResponse";

export interface createTodoRequest {
  description: string;
}

export interface Todo {
  id: string;
  description: string;
  dateCreated: Date;
}

export interface Potato {
  id: string;
  description: string;
  dateCreated: Date;
}

export interface ServiceDefinition extends RPCService<"Todo"> {
  //can resolve "Todo" with ts compiler
  createTodo?: RequestResponse<createTodoRequest, Todo>;
  createPotato?: RequestResponse<createTodoRequest, Potato>;
}

export interface ServiceDefinition2 extends RPCService<"Potato"> {
  //can resolve "Potato" with ts compiler
  createPotatoes?: RequestResponse<createTodoRequest, Todo>;
  createTomatoes?: RequestResponse<createTodoRequest, Potato>;
}
