import { Request, Response } from "express";
import { Controller, HttpRequest } from "../interfaces/index";
const adaptRoute = (controller: Controller) => {
  return async function (req: Request, res: Response) {
    const httpRequest: HttpRequest = {
      body: req.body,
      params: req.params,
      pathParameters: req.params,
      queryStringParameters: req.query,
    };
    try {
      const httpResponse = await controller.handle(httpRequest);
      res.status(httpResponse.statusCode).json(httpResponse.body);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  };
};

export default adaptRoute;
