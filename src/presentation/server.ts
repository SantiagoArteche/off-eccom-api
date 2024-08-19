import "dotenv/config";
import cookieParser from "cookie-parser";
import express, { Router } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerjsdoc from "swagger-jsdoc";

export class Server {
  private app = express();
  private PORT = process.env.PORT ?? 7070;
  private readonly options = {
    definition: {
      info: {
        title: "OFF API",
        version: "0.0.1",
        description: "API made for OFF E-Commerce",

        contact: {
          name: "Santiago Arteche",
          url: "https://portfolioarteche.vercel.app/",
          email: "santiagoarteche7@gmail.com",
        },
      },
      openapi: "3.1.0",
      servers: [
        {
          url: "http://localhost:7070/",
        },
      ],
    },
    apis: [`${__dirname}/docs/*.yaml`],
  };

  private specs = swaggerjsdoc(this.options);

  constructor(private routes: Router) {}

  async start() {
    this.app.use(express.json());
    this.app.use(cookieParser(process.env.SECRET_JWT));
    this.app.use(express.urlencoded({ extended: true }));

    this.app.use(this.routes);
    this.app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(this.specs));

    this.app.listen(this.PORT, () =>
      console.log(`Server running on port ${this.PORT}`)
    );
  }
}
