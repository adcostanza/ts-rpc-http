import { Observable } from 'rxjs/Observable';
import Client from 'ts-rpc-http/client';
import { 
  GalleryServiceDefinition,
  createTodoRequest,
  Todo,
  createWithReallyLongNameThatWillCauseWrappingRequest,
  createWithReallyLongNameThatWillCauseWrappingResponse,
} from './models';

export class GalleryClient {
  private client: Client<GalleryServiceDefinition>;
  constructor(baseURL: string) {
    this.client = new Client(baseURL);
  }

  public createTodo$ = (
    body: createTodoRequest,
    token?: string
  ): Observable<Todo> => this.client.call('createTodo', body, token);
  public reallyLongCreateThatWillCauseALotOfWrapping$ = (
    body: createWithReallyLongNameThatWillCauseWrappingRequest,
    token?: string
  ): Observable<createWithReallyLongNameThatWillCauseWrappingResponse> => this.client.call('reallyLongCreateThatWillCauseALotOfWrapping', body, token);
}
