import { RequestResponse } from "../../../src/requestResponse";

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

interface RPCService<T> {
  //this is only used for tracking
}
export interface ServiceDefinition extends RPCService<"Todo"> { //can resolve "Todo" with ts compiler
  createTodo?: RequestResponse<createTodoRequest, Todo>;
  createPotato?: RequestResponse<createTodoRequest, Potato>;
}