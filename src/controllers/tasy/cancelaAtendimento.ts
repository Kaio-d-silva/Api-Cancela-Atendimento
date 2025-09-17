import { HttpRequest, HttpResponse } from '../../interfaces';
import { getConnectionPacs, getConnectionTasy } from '../../database';
import { cancelaAtendimento, selectContaPaciente, selectStatusAtendimento, selectNrPrescricao, selectSequenciaInterna, selectAcessionNumber, selectCodigoUsuario} from './query';
import OracleDB from 'oracledb';
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

            const atendimentoIdNumber = Number(atendimentoId);
            
            if (isNaN(atendimentoIdNumber) || !Number.isInteger(atendimentoIdNumber)) {
                return {
                    statusCode: 400,
                    body: { error: "Atendimento ID inválido" },
                };
            }

            if (atendimentoIdNumber <= 0 || atendimentoId.length > 7){
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
            
            const connectionTasy = await getConnectionTasy();

            const statusAtendimento = await connectionTasy.execute(
                selectStatusAtendimento,
                { atendimentoIdNumber },
            ) // feito

            if (statusAtendimento.rows && statusAtendimento.rows.length > 0) {
                const row = statusAtendimento.rows[0] as [any, any];
                const dtCancelamento = row[0];
                const usuarioCancelamento = row[1];

                if (dtCancelamento !== null || usuarioCancelamento !== null) {
                    await connectionTasy.close();
                    return {
                        statusCode: 400,
                        body: { error:`Atendimento já está cancelado`, data : { dtCancelamento, usuarioCancelamento } },
                    };
                }
            }

            const contaPaciente = await connectionTasy.execute(
                selectContaPaciente,
                { atendimentoIdNumber },
            ); // feito

            if (contaPaciente.rows && contaPaciente.rows.length === 0) {
                await connectionTasy.close();
                return {
                    statusCode: 404,
                    body: { error: "Atendimento não tem conta paciente, logo o cancelamento deve ser manual" },
                };
            }


            const resultSelectPrescricao = await connectionTasy.execute(
                selectNrPrescricao,
                { atendimentoIdNumber },
                { outFormat: OracleDB.OUT_FORMAT_OBJECT }

            ); // feito

            // console.log('nrPrescricao:', resultSelectPrescricao.rows[0]);

            // Pegar o nuerode sequencia interna
            const row = resultSelectPrescricao.rows[0] as { NR_PRESCRICAO: number };
            var nrPrescricao = row?.NR_PRESCRICAO;

            if (!resultSelectPrescricao.rows.length ) {
                await connectionTasy.close();
                return {
                    statusCode: 404,
                    body: { error: "Atendimento não tem prescrição médica" },
                };
                
            }


            if (!nrPrescricao || nrPrescricao <= 0) {
                await connectionTasy.close();
                return {
                    statusCode: 404,
                    body: { error: "Atendimento não tem prescrição médica, logo o cancelamento deve ser manual" },
                };
            }
            

            

            const nrSequenciaInterna = await connectionTasy.execute(
                selectSequenciaInterna,
                { nrPrescricao },
            ); // feito
            
            // console.log('nrSequenciaInterna:', nrSequenciaInterna.rows[0]);

            const rowSeq = nrSequenciaInterna.rows[0] as [string];
            var nrSeqInterna = rowSeq[0].toString();
            
            // Logica de busco no PACS

            // const connectionPacs = await getConnectionPacs()
            // const resultSelectAcessionNumber = await connectionPacs.execute(
            //     selectAcessionNumber,
            //     { accessionNumber: nrSeqInterna},
            //     // { outFormat: OracleDB.OUT_FORMAT_OBJECT }
            // );

            // console.log(`Resultado select ${resultSelectAcessionNumber}`)

            // if (resultSelectAcessionNumber.rows && resultSelectAcessionNumber.rows.length > 0) {
            //     await connectionTasy.close();
            //     return {
            //         statusCode: 400,
            //         body: { error: "Atendimento tem exame no PACS" },
            //     };
            // }
            
            if (!nomeUsuario) {
                await connectionTasy.close();
                return {
                    statusCode: 400,
                    body: { error: "É necessário informar o nome do usuário que está realizando o cancelamento" },
                };
            }
            if (nomeUsuario.length < 3 || nomeUsuario.length > 30) {
                await connectionTasy.close();
                return {
                    statusCode: 400,
                    body: { error: "Nome do usuário inválido" },
                };
            }

            // Busca codigo do usuario 
            const rowCodUsuario = await connectionTasy.execute(
                selectCodigoUsuario,
                { nomeUsuario }, // feito
            );

            if (rowCodUsuario.rows && rowCodUsuario.rows.length === 0) {
                await connectionTasy.close();
                return {
                    statusCode: 404,
                    body: { error: "Usuário não encontrado" },
                };
            }

            //
            const codigoUsuario = rowCodUsuario.rows[0] as [number];
            console.log('codigoUsuario:', codigoUsuario);
            console.log('codigoUsuario:', codigoUsuario[0]);

            const result = await connectionTasy.execute(
                cancelaAtendimento,
                {
                    atendimentoId,
                    nomeUsuario,
                    codigoUsuario : codigoUsuario[0],
                    motivoCancelamento,
                },
            );

            connectionTasy.commit();

            if (!result) {
                await connectionTasy.close();
                return {
                    statusCode: 500,
                    body: { error: "Erro ao cancelar o atendimento" },
                };
            }


            await connectionTasy.close();

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