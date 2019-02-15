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

    try {
      const result = await axios.post(uri, body, { headers });
      return result.data as R;
    } catch (e) {
      throw Error(
        `Status Code ${e.response.status}: ${JSON.stringify(e.response.data, null, '\t')}`
      );
    }
  }
}
