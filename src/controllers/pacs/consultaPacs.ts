import { HttpRequest, HttpResponse } from '../../interfaces';
import getConnection from '../../database';
import { acessionNumber } from '../../enums/acessionNumber';

class ConsultarPacsController {
  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const connection = await getConnection();
      const { NA } = httpRequest.params;

      if (NA.type !== 'number' || NA <= 0 || isNaN(NA)) {
        return {
          statusCode: 400,
          body: { error: "NA invalido" },
        };
      }

      if (!NA) {
        return {
          statusCode: 400,
          body: { error: "NA não informado" },
        };
      }


      if (NA.length > acessionNumber.maxLehngth) {
        return {
          statusCode: 400,
          body: { error: "NA deve ser um número de até 8 dígitos" },
        };
      }

      const result = await connection.execute(
        `SELECT * FROM pacientes WHERE na = :na`,
        [NA],
        { outFormat: (await import('oracledb')).OUT_FORMAT_OBJECT } // retorna objeto em vez de array
      );

      if (result.rows.length === 0) {
        return {
          statusCode: 404,
          body: { error: "NA não encontrado" },
        };
      }

      await connection.close();

      return {
        statusCode: 200,
        body: result.rows, 
      };
    } catch (error: any) {
      console.error("Erro ao consultar:", error);
      return {
        statusCode: 500,
        body: { error: "Exame não encontrado" },
      };
    }
  }
}

export default ConsultarPacsController;
