import {ServiceDefinition} from "./../../example/server/src/models";
import {Server} from "../../src/server";

const path = require("path");

describe("server unit test", () => {
    test("starts and stops", async () => {
        const server = new Server<ServiceDefinition>();
        await server.start();
        await server.close();
    });
    test("schemas cant come after service definition", async () => {
        const server = new Server<ServiceDefinition>();
        server.rpc("createTodo", (req, res) => {
        });
        try {
            server.validateSchemas("test/schema");
        } catch (e) {
            expect(e.message).toBe(
                "validateSchemas must come before any rpc declaration, not after"
            );
        }
    });
});
