import { RequestResponse } from '../src/requestResponse';

export interface createTodoRequest {
  description: string;
}

export interface Todo {
  id: string;
  description: string;
  dateCreated: Date;
}

export interface createWithReallyLongNameThatWillCauseWrappingRequest {}
export interface createWithReallyLongNameThatWillCauseWrappingResponse {}

//@http-rpc(Todo)
export interface ServiceDefinition {
  createTodo: RequestResponse<createTodoRequest, Todo>;
  reallyLongCreateThatWillCauseALotOfWrapping: RequestResponse<
    createWithReallyLongNameThatWillCauseWrappingRequest, //comment on right side
    createWithReallyLongNameThatWillCauseWrappingResponse
  >;
  //inProgress: comment...
}
