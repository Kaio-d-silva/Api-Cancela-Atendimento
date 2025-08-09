import adaptRoute from "../adapters/express-route-adapter";
import { Router } from "express";
import CriarUsuarioController from "../controllers/pacs/consultaPacs";

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
   *   description: Consulta NA no banco do PACS para verificar se o mesmo existe
   */

  /**
   * @swagger
   * /api/consulta-na:
   *   get:
   *     summary: Consulta NA no banco do PACS para verificar se o mesmo existe
   *     tags: [PACS]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PACS'
   *     responses:
   *       201:
   *         description: O NA foi encontrado
   *       404:
   *         description: NA não encontrado
   *       500:
   *         description: Erro interno do servidor
   */
  router.get("/consulta-na", adaptRoute(new CriarUsuarioController()));
};
