import { getConnectionPacsMedlink } from "../../database";
import { HttpRequest, HttpResponse } from "../../interfaces";
import { PacsService } from "../../services/pacs/pacs-service";


class ConsultaMedicosController {
    async handle(request: HttpRequest): Promise<HttpResponse> {
        try {
            const pacsService = new PacsService(await getConnectionPacsMedlink())

            try {
                const medicos = await pacsService.consultaMedicosPacs();

                if (!medicos || medicos.length === 0) {
                    await pacsService.closeConnection();
                    return {
                        statusCode: 404,
                        body: { error: "Nenhum médico encontrado" },
                    };
                }

                await pacsService.closeConnection();

                return {
                    statusCode: 200,
                    body: { medicos },
                };

            } catch (error) {
                await pacsService.closeConnection();

                return {
                    statusCode: 500,
                    body: { error: `Erro ao consultar médicos ${error}` },
                }
            }
        } catch (error) {
            return {
                statusCode: 500,
                body: { error: `Erro interno no servidor: ${error}` },
            }
        }

    }
}

export default ConsultaMedicosController;