import "dotenv/config";
import cookieParser from "cookie-parser";
import express, { Router } from "express";

export class Server {
  public app = express();
  private PORT = process.env.PORT ?? 7070;
  private server: any;

  constructor(private routes: Router) {}

  async start() {
    this.app.use(express.json());
    this.app.use(cookieParser(process.env.SECRET_JWT));
    this.app.use(express.urlencoded({ extended: true }));

    this.app.use(this.routes);

    this.server = this.app.listen(this.PORT, () =>
      console.log(`Server running on port ${this.PORT}`)
    );
  }

  async close() {
    return new Promise<void>((resolve) => {
      if (this.server) {
        this.server.close(resolve);
      }
    });
  }
}
