import { Elysia } from "elysia";

const elysiaApp = new Elysia().get("/", () => "Hello Elysia").listen(3000);

console.log(
  `🦊 Elysia is running at ${elysiaApp.server?.hostname}:${elysiaApp.server?.port}`
);
