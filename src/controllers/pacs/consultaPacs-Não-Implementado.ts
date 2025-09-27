import { HttpRequest, HttpResponse } from '../../interfaces';
import { getConnectionPacs } from '../../database';
import { acessionNumber } from '../../enums/acessionNumber';
import { selectAcessionNumber } from '../../sql/pacs/pacs';

class ConsultarPacsController {
  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { accessionNumber } = httpRequest.params;
      const teste = httpRequest.params
      console.log(teste)
      // console.log(typeof accessionNumber, accessionNumber);

      // try {
      //   if (typeof accessionNumber !== 'number') {
      //     throw new Error("accessionNumber deve ser um número");
      //   }
      // } catch (error) {
      //   return {
      //     statusCode: 400,
      //     body: { error: "accessionNumber deve ser um número" },
      //   };
      // }

      console.log('NA informado', accessionNumber)

      if (accessionNumber <= 0) {
        return {
          statusCode: 400,
          body: { error: "accessionNumber invalido" },
        };
      }

      if (!accessionNumber) {
        return {
          statusCode: 400,
          body: { error: "accessionNumber não informado" },
        };
      }

      console.log(accessionNumber.toString().length)
      console.log(accessionNumber)
      if (accessionNumber.toString().length > acessionNumber.maxLehngth) {
        return {
          statusCode: 400,
          body: { error: "accessionNumber deve ser um número de até 8 dígitos" },
        };
      }

      const connectionPacs = await getConnectionPacs();
      const result = await connectionPacs.execute(
        selectAcessionNumber,
        [accessionNumber],
      );


      if (result.rows.length === 0) {
        return {
          statusCode: 404,
          body: { error: "accessionNumber não encontrado" },
        };
      }

      await connectionPacs.close();

      return {
        statusCode: 200,
        body: result.rows[0], // retoraccessionNumber o primeiro registro encontrado
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
