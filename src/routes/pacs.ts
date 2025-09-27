import adaptRoute from "../adapters/express-route-adapter";
import { Router } from "express";
import ConsultarPacsController from "../controllers/pacs/consultaPacs-Não-Implementado";

export default (router: Router): void => {
  /**
   * @swagger
   * components:
   *   securitySchemes:
   *     bearerAuth:
   *       type: http
   *       scheme: bearer
   *       bearerFormat: JWT
   */

  /**
   * @swagger
   * components:
   *   schemas:
   *     PACS:
   *       type: object
   *       required:
   *         - ACESSION NUMBER
   *       properties:
   *         ACESSION NUMBER:
   *           type: number
   *           description: Numero de acesso do PACS (NA)
   *       example:
   *         ACESSION NUMBER: 71837049
   */

  /**
   * @swagger
   * tags:
   *   name: PACS
   *   description: Ainda não implementado
   */

  /**
   * @swagger
   * /api/pacs/consulta-na/{accessionNumber}:
   *   get:
   *     summary: Ainda não implementado
   *     tags: [PACS]
   *     parameters:
   *       - in: path
   *         name: accessionNumber
   *         schema:
   *           type: string
   *         required: true
   *         description: Numero de acesso do PACS (NA)
   *     responses:
   *       201:
   *         description: O NA foi encontrado
   *       404:
   *         description: NA não encontrado
   *       500:
   *         description: Erro interno do servidor
   */
  router.get("/pacs/consulta-na/:accessionNumber", adaptRoute(new ConsultarPacsController()));
};
