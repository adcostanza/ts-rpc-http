import * as bodyParser from 'body-parser'; //used to parse the form data that you pass in the request
import * as express from 'express';
import * as http from 'http';
import * as path from 'path';
const util = require('util');
import { Request, RequestType, Response, ResponseType } from './requestResponse';
import { validateRequest } from './validator';
var cors = require('cors');
//@ts-ignore
global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

type ReturnType<X> = X extends (req: any, res: any) => infer T ? T : never;

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
    ) => express.Response | void | Promise<express.Response> | Promise<void>
  ) {
    this.app.post(('/' + routeName) as string, async (expressReq, expressRes) => {
      return closure(new Request(expressReq), new Response(expressRes));
    });
  }

  middleware(
    fn: (req: express.Request, res: express.Response, next: () => void) => void
  ) {
    this.app.use(function(req, res, next) {
      fn(req, res, next);
    });
  }

  //Note all requests must end with Request for this to work
  validateSchemas = (schemaPath: string) => {
    return this.middleware((req, res, next) => {
      const schemaFile = path.join(process.env.PWD, schemaPath, `${req.url}Request.json`);
      //will throw error for validation errors
      try {
        validateRequest(req.body, schemaFile);
        next();
      } catch (e) {
        res.status(400).send({ error: e.message });
      }
    });
  };

  async start(): Promise<Server<T>> {
    try {
      return await new Promise((success, err) =>
        this.app.listen(this.port, server => {
          console.log(`Server started on port ${this.port}...`);
          success(server);
        })
      );
    } catch (e) {
      throw Error(e);
    }
  }

  async close(): Promise<void> {
    try {
      await util.promisify(this.server.close());
    } catch (e) {
      throw Error(e);
    }
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
