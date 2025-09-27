import { HttpRequest, HttpResponse } from '../../interfaces';
import { getConnectionTasyHom } from '../../database';

class ConsultaContaPacienteController {
    async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
        try {

            const { atendimentoId } = httpRequest.params;

            console.log('Received atendimentoId:', atendimentoId);

            if (!atendimentoId) {
                return {
                    statusCode: 400,
                    body: { error: "Atendimento ID não informado" },
                };
            }

            const atendimentoIdNumber = Number(atendimentoId);

            if (isNaN(atendimentoIdNumber) || !Number.isInteger(atendimentoIdNumber)) {
                return {
                    statusCode: 400,
                    body: { error: "Atendimento ID inválido" },
                };
            }

            if (atendimentoIdNumber <= 0 || atendimentoId.length > 7) {
                return {
                    statusCode: 400,
                    body: { error: "Tamanho do Atendimento ID invalido " },
                }
            }

            const connection = await getConnectionTasyHom();
            console.log('Atendimento ID:', atendimentoIdNumber); // Log do ID do atendimento



            const contaPaciente = await connection.execute(
                `SELECT NR_ATENDIMENTO FROM CONTA_PACIENTE WHERE NR_ATENDIMENTO = :atendimentoIdNumber`,
                [atendimentoIdNumber],
            );  

            if (contaPaciente.rows && contaPaciente.rows.length === 0) {
                return {
                    statusCode: 404,
                    body: { error: "Conta paciente não encontrada" },
                };
            }

            return {
                statusCode: 200,
                body: { message: `Existe conta paciente` },
            }
        } catch (error) {
            return {
                statusCode: 500,
                body: { error: "Erro ao buscar conta paciente" },
            }
        }

    }
}

export default ConsultaContaPacienteController;