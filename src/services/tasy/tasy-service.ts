import OracleDB from "oracledb";
import { cancelaAtendimento, selectCodigoPessoaFisica, selectCodigoUsuario, selectContaPaciente, selectDadosPaciente, selectNrPrescricao, selectSequenciaInterna, selectStatusAtendimento } from "../../sql/tasy/query";

export class TasyService {
    connectionTasy: import("oracledb").Connection;

    constructor(connection: import("oracledb").Connection) {
        this.connectionTasy = connection;
    }

    async AtendimentoCancelado(idAtendimento: number) {
        const statusAtendimento = await this.connectionTasy.execute(
            selectStatusAtendimento,
            { idAtendimento },
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        )

        console.log('statusAtendimento Rows:', statusAtendimento.rows);

        if (!statusAtendimento.rows || statusAtendimento.rows.length === 0) {
            return false;
        }     

        const data = {
            dataCancelamento: statusAtendimento.rows ? (statusAtendimento.rows[0] as any).DT_CANCELAMENTO : null,
            usuarioCancelamento: statusAtendimento.rows ? (statusAtendimento.rows[0] as any).NM_USUARIO_CANCELAMENTO : null,
        }

        if (data.dataCancelamento !== null || data.usuarioCancelamento !== null) {
            return data;
        }

        return false;
    }

    async contaPaciente(idAtendimento: number) {
        const contaPaciente = await this.connectionTasy.execute(
            selectContaPaciente,
            { idAtendimento },
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );
        

        if (!contaPaciente.rows || contaPaciente.rows.length === 0) {
            return false;
        }

        console.log('contaPaciente Rows:', contaPaciente.rows);
        console.log('contaPaciente Rows:', contaPaciente.rows[0]);

        const data = {
            nrAtendimento: contaPaciente.rows ? (contaPaciente.rows[0] as any).NR_ATENDIMENTO : null,
            statusConta: contaPaciente.rows ? (contaPaciente.rows[0] as any).IE_STATUS_ACERTO : null,
        }

        return data;
    }

    async numeroPrescricao(idAtendimento: number) {
        const resultSelect = await this.connectionTasy.execute(
            selectNrPrescricao,
            { idAtendimento },
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }

        );
        const row = resultSelect.rows[0] as { NR_PRESCRICAO: number } | undefined;

        return row?.NR_PRESCRICAO;
    }

    async nrSequenciaInterna(nrPrescricao: number) {
        const nrSequenciaInterna = await this.connectionTasy.execute(
            selectSequenciaInterna,
            { nrPrescricao },
        );

        const rowSeq = nrSequenciaInterna.rows[0] as [string] | undefined;
        return rowSeq ? rowSeq[0].toString() : undefined;
    }

    async codigoUsuario(nomeUsuario: string) {
        const rowCodUsuario = await this.connectionTasy.execute(
            selectCodigoUsuario,
            { nomeUsuario },
        );
        const row = rowCodUsuario.rows[0] as [number] | undefined;
        return row ? Number(row[0]) : undefined;
    }

    async cancelarAtendimento(atendimentoId: string, nomeUsuario: string, codigoUsuario: number, motivoCancelamento: string) {
        const result = await this.connectionTasy.execute(
            cancelaAtendimento,
            {
                atendimentoId,
                nomeUsuario,
                codigoUsuario,
                motivoCancelamento,
            },
        );
        this.connectionTasy.commit();
        return result;
    }

    async consultaAtendimento(atendimentoId:number){

        const resultCodPessoa = await this.connectionTasy.execute(
            selectCodigoPessoaFisica,
            {atendimentoId},
        );

        console.log(resultCodPessoa.rows[0])

        const rowCosPessoa = resultCodPessoa.rows[0] as [number] | undefined

        const resultDadosPaciente = await this.connectionTasy.execute(
            selectDadosPaciente,
            {codigoPessoa: rowCosPessoa[0]},
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }           
        )

        const rowDadosPaciente = resultDadosPaciente.rows[0] 

        console.log(rowDadosPaciente)

        return rowDadosPaciente? rowDadosPaciente : undefined
    }

    async closeConnection() {
        try{
            await this.connectionTasy.close();
            console.log('TASY connection closed')
        } catch (error) {
            console.error('Error closing TASY connection')
        }
    }
}