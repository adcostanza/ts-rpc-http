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

  public createTodo = async (
    body: createTodoRequest,
    token?: string
  ): Promise<Todo> => this.client.call('createTodo', body, token);
  
  public reallyLongCreateThatWillCauseALotOfWrapping = async (
    body: createWithReallyLongNameThatWillCauseWrappingRequest,
    token?: string
  ): Promise<createWithReallyLongNameThatWillCauseWrappingResponse> => this.client.call('reallyLongCreateThatWillCauseALotOfWrapping', body, token);
  
}
