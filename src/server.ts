import * as bodyParser from 'body-parser'; //used to parse the form data that you pass in the request
import * as express from 'express';
import { Request, RequestType, Response, ResponseType } from './requestResponse';
var cors = require('cors');
//@ts-ignore
global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

export class Server<T> {
  private app: express.Express;
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
    ) => express.Response
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

  start(onStart?: () => void) {
    // start the express server
    this.app.listen(this.port, () => {
      // tslint:disable-next-line:no-console
      console.log(`server started at http://localhost:${this.port}`);
      onStart();
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
