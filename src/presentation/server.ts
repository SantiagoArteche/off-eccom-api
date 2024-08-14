import express, { Router } from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";

export class Server {
  private PORT = process.env.PORT ?? 7070;
  private app = express();

  constructor(private routes: Router) {}

  async start() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(this.routes);
    this.app.use(cookieParser());

    this.app.listen(this.PORT, () =>
      console.log(`Server running on port ${this.PORT}`)
    );
  }
}
