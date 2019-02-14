import * as request from 'request';
import { CoreOptions, UriOptions } from 'request';
import { RequestType, ResponseType } from './requestResponse';

export const post = (options: CoreOptions & UriOptions) =>
  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body.id); // Print the shortened url.
    }
  });

export default class Client<S> {
  private baseURL: string = '';

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async call<T extends keyof S, R = ResponseType<S[T]>>(
    name: T,
    body: RequestType<S[T]>,
    token?: string
  ): Promise<R> {
    const uri = this.baseURL + '/' + name;

    let options = {
      uri,
      method: 'POST',
      json: {
        body,
      },
    };
    if (token !== undefined) {
      options['headers'] = {};
      options['headers']['Authorization'] = token;
    }

    const result = await post(options);

    return JSON.parse(result.body as string) as R;
  }
}
