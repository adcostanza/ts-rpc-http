import { Server } from "../../src/server";
import { TodoClient } from "../clients";
import { ServiceDefinition } from "../models";

describe("client with token", () => {
  let server;

  beforeAll(async () => {
    server = new Server<ServiceDefinition>(5001);
    server.rpc("createTodo", (req, res) => {
      const token = req.headers["authorization"];
      res.status(200).send({
        description: token,
        dateCreated: new Date(),
        id: "random-id"
      });
    });
    await server.start();
  });

  afterAll(async () => {
    await server.close();
  });

  test("client with token is sent as Authorization header", async () => {
    const client = new TodoClient("http://localhost:5001");
    const description = "desc";
    const token = "super cool token";
    const result = await client.createTodo({ description }, token);
    expect(result.description).toEqual(token);
  });
});
