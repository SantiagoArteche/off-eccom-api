import "dotenv/config";
import cookieParser from "cookie-parser";
import express, { Router } from "express";

export class Server {
  private app = express();
  private PORT = process.env.PORT ?? 7070;

  constructor(private routes: Router) {}

  async start() {
    this.app.use(cookieParser());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    this.app.use(this.routes);

    this.app.listen(this.PORT, () =>
      console.log(`Server running on port ${this.PORT}`)
    );
  }
}
