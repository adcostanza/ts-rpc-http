import { Server } from "../../src/server";
import { TodoClient } from "../clients";
import { ServiceDefinition } from "../models";

const util = require("util");
const exec = util.promisify(require("child_process").exec);
const path = require("path");

describe("server/client integration", () => {
  let server;

  beforeAll(async () => {
    server = new Server<ServiceDefinition>(5001);
    server.validateSchemas("test/schema");
    server.rpc("createTodo", (req, res) => {
      res
        .status(200)
        .send({ ...req.body, dateCreated: new Date(), id: "random-id" });
    });
    await server.start();
  });

  afterAll(async () => {
    await server.close();
  });

  test("client works", async () => {
    const client = new TodoClient("http://localhost:5001");
    const description = "desc";
    const result = await client.createTodo({ description });
    expect(result.description).toEqual(description);
  });

  test("validation per jsonSchemas", async () => {
    const client = new TodoClient("http://localhost:5001");
    try {
      //@ts-ignore
      const result = await client.createTodo({});
    } catch (e) {
      expect(
        e
          .toString()
          .indexOf(
            "Validation errors: instance requires property `description`"
          ) > 0
      ).toBe(true);
    }
  });
});
