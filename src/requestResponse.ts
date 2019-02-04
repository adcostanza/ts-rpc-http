import * as express from 'express';

export class Response<T> {
  constructor(private response: express.Response) {}
  status = (status: number) => {
    return new ResponseWithStatus(this.response, status);
  };
}

export class ResponseWithStatus<T> {
  constructor(private response: express.Response, private status: number) {}
  send = (body: T) => {
    return this.response.status(this.status).send(body);
  };
  done = () => {
    return this.response.status(this.status);
  };
}

export class Request<T> {
  constructor(private request: express.Request) {}
  get body(): T {
    //@ts-ignore
    return this.request.body as T;
  }
  get headers(): Record<string, any> {
    return this.request.headers;
  }
}

export interface RequestResponse<T, R> {
  request: T;
  response: R;
}
export type RequestType<X> = X extends RequestResponse<infer T, infer R> ? T : never;
export type ResponseType<X> = X extends RequestResponse<infer T, infer R> ? R : never;
export type ServiceKey<X> = keyof X;
