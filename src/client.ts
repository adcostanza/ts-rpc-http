const axios = require('axios');
import { RequestType, ResponseType } from './requestResponse';

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

    const headers = { 'Content-Type': 'application/json' };
    if (token !== undefined) {
      headers['Authorization'] = token;
    }

    const result = await axios.post(uri, body, { headers });

    if (result.status == 200) {
      return result.data as R;
    } else {
      throw Error(result.error);
    }
  }
}
