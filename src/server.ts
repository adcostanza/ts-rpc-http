import * as bodyParser from "body-parser"; //used to parse the form data that you pass in the request
import * as express from "express";
import * as http from "http";
import * as path from "path";

import {
  Request,
  RequestType,
  Response,
  ResponseType
} from "./requestResponse";
import { validateRequest } from "./validator";

const cors = require("cors");
//@ts-ignore
global.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

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
    this.app.post(("/" + routeName) as string, (expressReq, expressRes) => {
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
    //should be 5 if no routes have been added
    const routerStackSize = this.app._router.stack.length;
    if (routerStackSize > 5) {
      throw new Error(
        "validateSchemas must come before any rpc declaration, not after"
      );
    }
    return this.middleware((req, res, next) => {
      //TODO need a better way that doesn't require convention
      const schemaFile = path.join(
        process.cwd(),
        schemaPath,
        `${req.url}Request.json`
      );
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
    this.server = await new Promise(resolve => {
      const _server = this.app.listen(this.port, () => {
        console.log(`Server started on port ${this.port}...`);
        resolve(_server);
      });
    });
    return this;
  }

  async close(): Promise<void> {
    return new Promise(resolve => {
      this.server.close(() => {
        resolve();
      });
    });
  }

  private config(): void {
    // support application/json type post data
    this.app.use(bodyParser.json());
    //support application/x-www-form-urlencoded post data
    this.app.use(
      bodyParser.urlencoded({
        extended: false
      })
    );
  }
}
