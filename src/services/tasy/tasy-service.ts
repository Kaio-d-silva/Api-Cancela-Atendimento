import OracleDB from "oracledb";
import { cancelaAtendimento, selectCodigoPessoaFisica, selectCodigoUsuario, selectContaPaciente, selectDadosPaciente, selectMaterialConta, selectNrPrescricao, selectSequenciaInterna, selectStatusAtendimento } from "../../sql/tasy/query";

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

    async verificaContaPaciente(idAtendimento: number) {
        const contaPaciente = await this.connectionTasy.execute(
            selectContaPaciente,
            { idAtendimento },
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );


        if (!contaPaciente.rows || contaPaciente.rows.length === 0) {
            return false;
        }

        const statusConta = contaPaciente.rows as [{ IE_STATUS_ACERTO: number }]

        return statusConta;
    }

    async numeroPrescricao(idAtendimento: number) {
        const resultSelect = await this.connectionTasy.execute(
            selectNrPrescricao,
            { idAtendimento },
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }

        );
        if (!resultSelect || resultSelect == null){
            return false
        }
        const prescricoes = resultSelect.rows as [{ NR_PRESCRICAO: number }] | undefined

        return prescricoes
    }

    async nrSequenciaInterna(nrPrescricoes: [{ NR_PRESCRICAO: number }]): Promise<number[]> {
        const prescricoes = nrPrescricoes.map(presc => presc.NR_PRESCRICAO)

        let nrsSequenciainterna: number[] = []

        for (const presc of prescricoes) {
            const result = await this.connectionTasy.execute(
                selectSequenciaInterna,
                { nrPrescricao: presc },
            );

            for (const seqInt of result.rows as number[]) {
                nrsSequenciainterna.push(seqInt)

            }
        }
        return nrsSequenciainterna
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

    async consultaAtendimento(atendimentoId: number) {

        const resultCodPessoa = await this.connectionTasy.execute(
            selectCodigoPessoaFisica,
            { atendimentoId },
        );

        console.log(resultCodPessoa.rows[0])

        const rowCosPessoa = resultCodPessoa.rows[0] as [number] | undefined

        const resultDadosPaciente = await this.connectionTasy.execute(
            selectDadosPaciente,
            { codigoPessoa: rowCosPessoa[0] },
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        )

        const rowDadosPaciente = resultDadosPaciente.rows[0]

        console.log(rowDadosPaciente)

        return rowDadosPaciente ? rowDadosPaciente : undefined
    }

    async verificaMaterialMedico(idAtendiemento: number) {
        const result = await this.connectionTasy.execute(
            selectMaterialConta,
            { idAtendiemento },
        )

        if (!result.rows || result.rows.length === 0) {
            return false
        }

        const rows = result.rows as Array<[number | null]>;

        // verifico se há algum material sem motico de cancelamento
        const existeNull = rows.some(item => item[0] === null);

        return existeNull
    }

    async closeConnection() {
        try {
            await this.connectionTasy.close();
            console.log('TASY connection closed')
        } catch (error) {
            console.error('Error closing TASY connection')
        }
    }
}