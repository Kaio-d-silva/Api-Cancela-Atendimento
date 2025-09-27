import OracleDB from "oracledb";
import { selectAcessionNumber } from "../../sql/pacs/pacs";

export class PacsService {
    connectionPacs: import("oracledb").Connection;

    constructor(connection: import("oracledb").Connection) {
        this.connectionPacs = connection;
    }

    async closeConnection() {
        try {
            await this.connectionPacs.close();
            console.log('PACS connection closed');
        } catch (error) {
            console.error('Error closing PACS connection:', error);
        }
    }

    async consultaSequenciaInterna(sequenciaInterna: string) {
        const resultSelect = await this.connectionPacs.execute(
            selectAcessionNumber,
            { accessionNumber: sequenciaInterna },
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );

        const rowSeq = resultSelect.rows[0] ? (resultSelect.rows[0] as any).ACCESSION_NUMBER : false;

        return rowSeq
        
    }
}