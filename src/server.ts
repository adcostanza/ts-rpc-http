import * as bodyParser from 'body-parser'; //used to parse the form data that you pass in the request
import * as express from 'express';
import { Request, RequestType, Response, ResponseType } from './requestResponse';
import { Observable } from 'rxjs/Observable';
import * as http from 'http';
var cors = require('cors');
//@ts-ignore
global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

export class Server<T> {
  private app: express.Express;
  private server: http.Server;
  constructor(private port?: number) {
    this.app = express();
    this.app.use(cors());
    this.config();
    if (port == undefined) {
      this.port = 5001; //default port
    }
  }

  rpc<A extends keyof T, B extends T[A]>(
    routeName: A,
    closure: (
      req: Request<RequestType<B>>,
      res: Response<ResponseType<B>>
    ) => express.Response | void
  ) {
    this.app.post(('/' + routeName) as string, (expressReq, expressRes) => {
      return closure(new Request(expressReq), new Response(expressRes));
    });
  }

  middlware(fn: (req: express.Request, res: express.Response, next: () => void) => void) {
    this.app.use(function(req, res, next) {
      fn(req, res, next);
    });
  }

  start(): Observable<Server<T>> {
    return Observable.create(observer => {
      try {
        this.server = this.app.listen(this.port, () => {
          console.log(`server started at http://localhost:${this.port}`);
        });

        observer.next(this);
        observer.complete();
      } catch (e) {
        observer.error(e);
        observer.complete();
      }
    });
    // start the express server
  }

  close(): Observable<void> {
    return Observable.create(observer => {
      try {
        this.server.close(() => {
          observer.next();
          observer.complete();
        });
      } catch (e) {
        observer.error(e);
        observer.complete();
      }
    });
  }

  private config(): void {
    // support application/json type post data
    this.app.use(bodyParser.json());
    //support application/x-www-form-urlencoded post data
    this.app.use(
      bodyParser.urlencoded({
        extended: false,
      })
    );
  }
}
