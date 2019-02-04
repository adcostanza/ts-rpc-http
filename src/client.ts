import { Observable } from 'rxjs/Observable';
import { ajax } from 'rxjs/observable/dom/ajax';
import { map } from 'rxjs/operators/map';
import { ResponseType, RequestType } from './requestResponse';

export default class Client<S> {
  private baseURL: string = '';

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  call<T extends keyof S, R = ResponseType<S[T]>>(
    name: T,
    body: RequestType<S[T]>,
    token?: string
  ): Observable<R> {
    let headers = { 'Content-Type': 'application/json' };
    if (token !== undefined) {
      headers['Authorization'] = token;
    }
    const url = this.baseURL + '/' + name;

    return ajax({ url, body, headers, method: 'POST' }).pipe(
      map(res => res.response as R)
    );
  }
}