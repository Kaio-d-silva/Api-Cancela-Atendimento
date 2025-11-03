import OracleDB from "oracledb";
import { selectAcessionNumber, selectMedicosPacs } from "../../sql/pacs/pacs";

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

    async consultaSequenciaInterna(sequenciasInternas: number[]) {

        let seqNoPacs = []
        for (const seq of sequenciasInternas ){
            const seqFormat = seq.toString()

            const resultSelect = await this.connectionPacs.execute(
                selectAcessionNumber,
                { accessionNumber: seqFormat },
            );
            if (resultSelect.rows === null || resultSelect.rows.length === 0 ){
                continue
            }
            const row = resultSelect.rows[0] as any
            const data = row[0]
            seqNoPacs.push(data)
        }

        return seqNoPacs
        
    }
    async consultaMedicosPacs() {
        const resultSelect = await this.connectionPacs.execute(selectMedicosPacs);
        return resultSelect.rows;
    }

        
}