import { HttpRequest, HttpResponse } from '../../interfaces';
import { getConnectionPacs, getConnectionTasyProd } from '../../database';
import { TasyService } from '../../services/tasy/tasy-service';
import { PacsService } from '../../services/pacs/pacs-service';
class CancelaAtendimentoController {
    async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
        try {

            const { atendimentoId, motivoCancelamento, nomeUsuario } = httpRequest.body

            if (!atendimentoId) {
                return {
                    statusCode: 400,
                    body: { error: "É necessário informar o numero do atendimento" },
                };
            }

            const idAtendimento = Number(atendimentoId);

            if (isNaN(idAtendimento) || !Number.isInteger(idAtendimento)) {
                return {
                    statusCode: 400,
                    body: { error: "Atendimento ID inválido" },
                };
            }

            if (idAtendimento <= 0 || atendimentoId.length > 7) {
                return {
                    statusCode: 400,
                    body: { error: "Tamanho do Atendimento ID invalido " },
                }
            }

            if (!motivoCancelamento) {
                return {
                    statusCode: 400,
                    body: { error: "É necessário informar o motivo do cancelamento" },
                };
            }

            if (typeof motivoCancelamento !== 'string' || motivoCancelamento.length < 3) {
                return {
                    statusCode: 400,
                    body: { error: "Motivo de cancelamento inválido" },
                };
            }

            if (motivoCancelamento.length > 255) {
                return {
                    statusCode: 400,
                    body: { error: "Motivo de cancelamento muito longo" },
                };
            }

            if (!nomeUsuario) {
                return {
                    statusCode: 400,
                    body: { error: "É necessário informar o nome do usuário que está realizando o cancelamento" },
                };
            }

            if (nomeUsuario.length < 3 || nomeUsuario.length > 30) {
                return {
                    statusCode: 400,
                    body: { error: "Nome do usuário inválido" },
                };
            }

            const tasyService = new TasyService(await getConnectionTasyProd());

            const statusAtendimento = await tasyService.AtendimentoCancelado(idAtendimento);

            if (statusAtendimento) {
                const { dataCancelamento, usuarioCancelamento } = statusAtendimento;

                if (dataCancelamento !== null || usuarioCancelamento !== null) {
                    await tasyService.closeConnection();
                    return {
                        statusCode: 400,
                        body: { error: `Atendimento já está cancelado`, data: { dataCancelamento, usuarioCancelamento } },
                    };
                }
            }

            const nrPrescricao = await tasyService.numeroPrescricao(idAtendimento);
            console.log('nrPrescricao:', nrPrescricao);


            if (!nrPrescricao || nrPrescricao <= 0) {
                await tasyService.closeConnection();
                return {
                    statusCode: 404,
                    body: { error: "Atendimento não tem prescrição médica, logo o cancelamento deve ser manual" },
                };
            }



            const nrSequenciaInterna = await tasyService.nrSequenciaInterna(nrPrescricao);
            console.log('nrSequenciaInterna:', nrSequenciaInterna);

            // Logica de busco no PACS

            const pacsService = new PacsService(await getConnectionPacs())
            const resultPacsSelect = await pacsService.consultaSequenciaInterna(nrSequenciaInterna)


            if (resultPacsSelect) {
                pacsService.closeConnection()
                return {
                    statusCode: 400,
                    body: { error: "Atendimento tem exame no PACS" },
                };
            }



            const statusContaPaciente = await tasyService.contaPaciente(idAtendimento);


            if (statusContaPaciente === false) {
                tasyService.closeConnection();
                return {
                    statusCode: 404,
                    body: { error: "Atendimento não tem conta paciente, logo o cancelamento deve ser manual" },
                };
            }
            
            if(statusContaPaciente){
                const {statusConta} = statusContaPaciente

                if(statusConta == 2){
                    return{
                        statusCode:400,
                        body: { error: "Conta paciente com status de definitivo"}
                    }
                }
            }


            // Busca codigo do usuario 
            console.log('nomeUsuario:', nomeUsuario);
            const codUsuario = await tasyService.codigoUsuario(nomeUsuario);

            if (!codUsuario) {
                await tasyService.closeConnection();
                return {
                    statusCode: 404,
                    body: { error: "Usuário não encontrado" },
                };
            }

            const result = await tasyService.cancelarAtendimento(atendimentoId, nomeUsuario, codUsuario, motivoCancelamento);

            if (!result) {
                await tasyService.closeConnection();
                return {
                    statusCode: 500,
                    body: { error: "Erro ao cancelar o atendimento" },
                };
            }


            await tasyService.closeConnection();


            return {
                statusCode: 200,
                body: { message: ` Atendimento cancelado com sucesso ` },
            }



        } catch (error) {
            return {
                statusCode: 500,
                body: { error: `Erro ao cancelar atendimento ${error}` },
            }
        }
    }
}

export default CancelaAtendimentoController;