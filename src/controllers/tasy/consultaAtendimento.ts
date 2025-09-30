import { HttpRequest, HttpResponse } from '../../interfaces';
import { getConnectionTasyHom, getConnectionTasyProd } from '../../database';
import { TasyService } from '../../services/tasy/tasy-service';

class ConsultaAtendimentoController {
    async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
        try {
            
            const tasyService = new TasyService(await getConnectionTasyProd());

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


                const dadosAtendimento = await tasyService.consultaAtendimento(atendimentoId)

                if (dadosAtendimento === undefined) {
                    return {
                        statusCode: 400,
                        body: { error: "Sem sucesso ao buscar dados" }
                    }
                }

                tasyService.closeConnection()

                return {
                    statusCode: 200,
                    body: dadosAtendimento,
                }
            } catch (error) {
                await tasyService.closeConnection()
                return {
                    statusCode: 500,
                    body: { error: `Erro ao consultar atendimento ${error}` },
                }
            }
        } catch (error) {
            console.log("Erro ao iniciar o banco de dados ")
        }
    }
}

export default ConsultaAtendimentoController;