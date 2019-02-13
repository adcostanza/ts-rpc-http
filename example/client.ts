import { Observable } from 'rxjs/Observable';
import Client from 'ts-rpc-http/client';
import { 
  ServiceDefinition,
  createTodoRequest,
  Todo,
  createWithReallyLongNameThatWillCauseWrappingRequest,
  createWithReallyLongNameThatWillCauseWrappingResponse,
} from './models';

export class TodoClient {
  private client: Client<ServiceDefinition>;
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
