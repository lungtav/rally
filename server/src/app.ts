import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { appRouter } from "./routes/index.js";

import { errorHandler } from "./middleware/errorHandler.js";

export const createApp = function () {
  const app = express();

  app.use(cors());
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded());

  //routes
  app.use("/api", appRouter);

  //error handler
  app.use(errorHandler);

  return app;
};
