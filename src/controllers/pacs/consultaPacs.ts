import { HttpRequest, HttpResponse } from '../../interfaces';
class ConsultarPacsController {
  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      return {
        statusCode: 200,
        body: { message: 'Exame encrontado com sucesso' },
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        body: { error: error.message },
      };
    }
  }
}

export default ConsultarPacsController;
