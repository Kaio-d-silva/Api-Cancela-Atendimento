import express from "express";
import setupMiddlewares from "./middlewares";
import setupRoutes from "./routes";
import { swaggerUi, specs } from "../swaggerConfig";

const app = express();
app.get("/", (req, res) => {
  res.redirect("/api-docs");
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
setupMiddlewares(app);
setupRoutes(app);
export default app;
