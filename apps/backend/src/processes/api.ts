import { Elysia } from "elysia";

export const startApiProcess = () => {
  const elysiaApp = new Elysia().get("/", () => "Hello Elysia").listen(3000);

  console.log(
    `🦊 Elysia is running at ${elysiaApp.server?.hostname}:${elysiaApp.server?.port}`
  );
};

if (import.meta.main) {
  startApiProcess();
}
