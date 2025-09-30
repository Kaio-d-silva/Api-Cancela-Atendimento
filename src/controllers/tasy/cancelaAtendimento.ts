import { HttpRequest, HttpResponse } from '../../interfaces';
import { getConnectionPacs, getConnectionTasyProd } from '../../database';
import { TasyService } from '../../services/tasy/tasy-service';
import { PacsService } from '../../services/pacs/pacs-service';
class CancelaAtendimentoController {
    async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
        try {
            const tasyService = new TasyService(await getConnectionTasyProd());
            const pacsService = new PacsService(await getConnectionPacs())

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

                const prescricoes = await tasyService.numeroPrescricao(idAtendimento);
                // console.log('nrPrescricao:', prescricoes);




                if (!prescricoes || prescricoes.length <= 0) {
                    await tasyService.closeConnection();
                    return {
                        statusCode: 404,
                        body: { error: "Atendimento não tem prescrição médica, logo o cancelamento deve ser manual" },
                    };
                }



                const nrsSequenciaInterna = await tasyService.nrSequenciaInterna(prescricoes);

                console.log('nrSequenciaInterna:', nrsSequenciaInterna);

                // Logica de busco no PACS
                
                const resultPacsSelect = await pacsService.consultaSequenciaInterna(nrsSequenciaInterna)

                console.log(resultPacsSelect)
                if (resultPacsSelect && resultPacsSelect.length > 0) {
                    await pacsService.closeConnection()
                    await tasyService.closeConnection()
                    return {
                        statusCode: 400,
                        body: { error:  `Atendimento tem exame no PACS ${resultPacsSelect[0]}` },
                    };
                }
                await pacsService.closeConnection()




                const statusContaPaciente = await tasyService.verificaContaPaciente(idAtendimento);


                if (statusContaPaciente === false) {
                    await tasyService.closeConnection();
                    return {
                        statusCode: 404,
                        body: { error: "Atendimento não tem conta paciente, logo o cancelamento deve ser manual" },
                    };
                }

                if (statusContaPaciente) {
                    for (const obj of statusContaPaciente) {
                        if (Number(obj.IE_STATUS_ACERTO) === 2) {
                            return {
                                statusCode: 400,
                                body: { error: "Conta paciente com status de definitivo" }
                            }
                        }
                    };

                }

                const materiaisConta = await tasyService.verificaMaterialMedico(idAtendimento)

                if (materiaisConta){
                    await tasyService.closeConnection();
                    return{
                        statusCode: 400,
                        body: { error: "Exclua o material da conta ou faça o cancelamento manual"}
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

                const statusAtendimentoPosCancelamento = await tasyService.AtendimentoCancelado(idAtendimento);

                console.log(statusAtendimentoPosCancelamento)
                if (!statusAtendimentoPosCancelamento){
                    await tasyService.closeConnection
                    return{
                        statusCode: 400,
                        body: { error: `Atendimento não cancelado, faça manualmente`}
                    }
                }


                await tasyService.closeConnection();


                return {
                    statusCode: 200,
                    body: { message: ` Atendimento cancelado com sucesso ` },
                }



            } catch (error) {
                await pacsService.closeConnection()
                await tasyService.closeConnection();

                return {
                    statusCode: 500,
                    body: { error: `Erro ao cancelar atendimento ${error}` },
                }
            }
        } catch {
            console.log("erro ao iniciar banco de dados")
        }
    }
}

export default CancelaAtendimentoController;