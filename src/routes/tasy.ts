import adaptRoute from "../adapters/express-route-adapter";
import { Router } from "express";
import CancelaAtendimentoController from "../controllers/tasy/cancelaAtendimento";
import ConsultaAtendimentoController from "../controllers/tasy/consultaAtendimento";


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
     *     TASY:
     *       type: object
     *       required:
     *         - atendimentoId
     *         - motivoCancelamento
     *         - nomeUsuario
     *       properties:
     *         atendimentoId:
     *           type: string
     *           description: ID do atendimento a ser cancelado
     *         motivoCancelamento:
     *           type: string
     *           description: Motivo do cancelamento do atendimento
     *         nomeUsuario:
     *           type: string
     *           description: usuário tasy de quem ira cancelar o atendimento.
     *       example:
     *         atendimentoId: "1672596"
     *         motivoCancelamento: "Paciente não compareceu"
     *         nomeUsuario: "kaio.silva"
     */

    /**
     * @swagger
     * tags:
     *   name: TASY
     *   description: Consulta e cancela atendimentos no sistema TASY
     */

    /**
     * @swagger
     * /api/tasy/cancelar-atendimento:
     *   post:
     *     summary: Cancela um atendimento no sistema TASY
     *     description: Cancela um atendimento no sistema TASY com base no ID do atendimento
     *     tags: [TASY]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/TASY'
     *     responses:
     *       200:
     *         description: Atendimento cancelado com sucesso
     *       400:
     *         description: Erro de validação, ID ou motivo inválidos
     *       500:
     *         description: Erro interno do servidor ao cancelar o atendimento
     */
    router.post("/tasy/cancelar-atendimento", adaptRoute(new CancelaAtendimentoController()));




    /**
   * @swagger
   * /api/tasy/consulta-atendimento/{atendimentoId}:
   *   get:
   *     summary: Consulta atendimento no sistema TASY
   *     tags: [TASY]
   *     parameters:
   *       - in: path
   *         name: atendimentoId
   *         schema:
   *           type: integer
   *         required: true
   *         description: ID do atendimento para consulta dos dados
   *     responses:
   *       200:
   *         description: Atendimento encontrado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Dados do atendimento"
   *       400:
   *         description: Erro de validação, ID inválido ou não informado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "Atendimento ID inválido"
   *       404:
   *         description: Atendimento não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "Atendimento não encotrado"
   *       500:
   *         description: Erro interno do servidor ao buscar dados do atendimento
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "Erro ao buscar atendimento"
   * 
   */
    router.get('/tasy/consulta-atendimento/:atendimentoId', adaptRoute(new ConsultaAtendimentoController()));
};

