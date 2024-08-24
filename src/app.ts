import { AppRoutes } from "./presentation/routes";
import { Server } from "./presentation/server";

(async () => {
  main();
})();

async function main() {
  const server = new Server(AppRoutes.routes);
  await server.start();
}
