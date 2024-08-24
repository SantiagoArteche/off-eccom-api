import { AppRoutes } from "../src/presentation/routes";
import { Server } from "../src/presentation/server";

export const testServer = new Server(AppRoutes.routes);
