import { HttpRequest, HttpResponse } from '../../interfaces';
import { getConnectionTasyHom, getConnectionTasyProd } from '../../database';
import { TasyService } from '../../services/tasy/tasy-service';
import { error } from 'console';

class ConsultaAtendimentoController {
  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {

        let { atendimentoId } = httpRequest.params

        atendimentoId = Number(atendimentoId)

        if (!atendimentoId) {
            return {
                statusCode: 400,
                body: { error: "Atendimento ID não informado" },
            };
        }
        if (typeof atendimentoId !== 'number' || atendimentoId <= 0) {
            return {
                statusCode: 400,
                body: { error: "Atendimento ID inválido" },
            };
        }

        const tasyService = new TasyService(await getConnectionTasyProd());

        const dadosAtendimento = await tasyService.consultaAtendimento(atendimentoId)

        if(dadosAtendimento === undefined){
            return{
                statusCode: 400,
                body: { error: "Sem sucesso ao buscar dados"}
            }
        }

        tasyService.closeConnection()
        // const atendimento = connection.execute(
        //     `SELECT id, paciente FROM atendimentos WHERE id = :id`,
        //     [atendimentoId],
        //     { autoCommit: true }
        // );

        // await connection.close();
        
        return{
            statusCode: 200,
            body: dadosAtendimento,
        }
    } catch (error) {
        return{
            statusCode: 500,
            body: { error: `Erro ao cancelar atendimento ${error}` },
        }
    }
  }
}

export default ConsultaAtendimentoController;