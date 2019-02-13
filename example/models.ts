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

//@http-rpc(Gallery)
export interface GalleryServiceDefinition {
  createTodo: RequestResponse<createTodoRequest, Todo>;
  reallyLongCreateThatWillCauseALotOfWrapping: RequestResponse<
    createWithReallyLongNameThatWillCauseWrappingRequest,
    createWithReallyLongNameThatWillCauseWrappingResponse
  >;
}
