import "./Config.ts";

import cApiRouter from "../routes/Api.Router.ts";

const cPort = Number(Deno.env.get("APP_PORT")) || 8000;
if (!cPort) {
  throw new Error("APP_PORT is not defined in the .env file");
}

Deno.serve({
  port: cPort,
  handler: cApiRouter.route.bind(cApiRouter),
  onListen: ({ hostname, port }) => {
    console.log(`HTTP server running. Access it at: http://${hostname}:${port}/`);
  },
});