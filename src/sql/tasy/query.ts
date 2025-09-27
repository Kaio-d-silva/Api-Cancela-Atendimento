export const cancelaAtendimento = 
`DECLARE
    TYPE t_num IS TABLE OF NUMBER;

    -- >>> AJUSTE AQUI SUA LISTA DE ATENDIMENTOS <<<
    v_atend t_num := t_num(:atendimentoId);

    -- Se quiser parametrizar o usuário/códigos, centralize aqui:
    c_user              CONSTANT VARCHAR2(50) := :nomeUsuario;
    c_motivo_cancel     CONSTANT NUMBER       := 7;         -- motivo do cancelamento
    c_cd_pessoa_fisica  CONSTANT NUMBER       := :codigoUsuario;  -- quem cancela
    c_obs_cancel        CONSTANT VARCHAR2(200):= :motivoCancelamento;

    FUNCTION has_material(p_nr_atendimento NUMBER) RETURN NUMBER IS
        v_qtd NUMBER;
    BEGIN
        SELECT COUNT(1)
        INTO   v_qtd
        FROM   MATERIAL_ATEND_PACIENTE map
        WHERE  map.nr_interno_conta IN (
                   SELECT cp.nr_interno_conta
                   FROM   conta_paciente cp
                   WHERE  cp.nr_atendimento = p_nr_atendimento
               );
        RETURN v_qtd; -- 0 = sem material; >0 = tem material
    END;

BEGIN
    FOR i IN 1 .. v_atend.COUNT LOOP
        DBMS_OUTPUT.PUT_LINE('==============================');
        DBMS_OUTPUT.PUT_LINE('Atendimento: ' || v_atend(i));

        -- 1) Carrega contas do atendimento
        DECLARE
            v_contas t_num;
        BEGIN
            SELECT cp.nr_interno_conta
            BULK COLLECT INTO v_contas
            FROM   conta_paciente cp
            WHERE  cp.nr_atendimento = v_atend(i);

            IF v_contas.COUNT = 0 THEN
                DBMS_OUTPUT.PUT_LINE('Nenhuma conta encontrada. Prosseguindo para verificar prescrições e cancelamento.');
            ELSE
                -- 2) Verifica material em qualquer conta
                IF has_material(v_atend(i)) > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('CONTA COM MATERIAL VINCULADO. Nenhuma ação executada para este atendimento.');
                    CONTINUE; -- pula para o próximo atendimento
                END IF;

                -- 3) Exclui todas as contas (não há material em nenhuma)
                DBMS_OUTPUT.PUT_LINE('Sem material vinculado. Excluindo contas do atendimento...');
                FOR idx IN 1 .. v_contas.COUNT LOOP
                    DBMS_OUTPUT.PUT_LINE(' - EXCLUIR_CONTA_PACIENTE('||v_contas(idx)||',''TASY'',''S'');');
                    EXCLUIR_CONTA_PACIENTE(v_contas(idx), :nomeUsuario, 'S'); -- ajuste o usuário se necessário
                END LOOP;
            END IF;

            -- 4) Suspende prescrições ativas (dt_suspensao IS NULL)
            DECLARE
                v_prescricoes t_num;
            BEGIN
                SELECT a.nr_prescricao
                BULK COLLECT INTO v_prescricoes
                FROM   prescr_medica a
                WHERE  a.nr_atendimento = v_atend(i)
                AND    a.dt_suspensao IS NULL;

                IF v_prescricoes.COUNT > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('Suspensões de prescrição: ' || v_prescricoes.COUNT || ' encontrada(s).');
                    FOR j IN 1 .. v_prescricoes.COUNT LOOP
                        DBMS_OUTPUT.PUT_LINE(' - SUSPENDER_PRESCRICAO('||v_prescricoes(j)||',0,'''','''||c_user||''',''N'');');
                        SUSPENDER_PRESCRICAO(v_prescricoes(j), 0, '', c_user, 'N');
                    END LOOP;
                ELSE
                    DBMS_OUTPUT.PUT_LINE('Nenhuma prescrição ativa para suspender.');
                END IF;
            END;

            -- 5) Cancela o atendimento
            DBMS_OUTPUT.PUT_LINE('Cancelando atendimento ' || v_atend(i) || ' ...');
            CANCELAR_ATENDIMENTO_PACIENTE(
                 v_atend(i)
                ,c_user
                ,c_motivo_cancel
                ,c_cd_pessoa_fisica
                ,c_obs_cancel
                ,NULL
                ,NULL
                ,'S'
                ,NULL
                ,NULL
            );
            DBMS_OUTPUT.PUT_LINE('Atendimento ' || v_atend(i) || ' cancelado com sucesso.');
        END;
    END LOOP;

    -- COMMIT; -- descomente se quiser confirmar aqui (caso as procedures não efetivem por conta própria)
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('ERRO: ' || SQLCODE || ' - ' || SQLERRM);
        -- ROLLBACK; -- opcional, conforme sua política transacional
END; `


export const selectCodigoUsuario = `SELECT CD_PESSOA_FISICA FROM USUARIO WHERE nm_usuario = :nomeUsuario`

export const selectContaPaciente = `SELECT NR_ATENDIMENTO FROM CONTA_PACIENTE WHERE NR_ATENDIMENTO = :idAtendimento`

export const selectStatusAtendimento = `SELECT DT_CANCELAMENTO, NM_USUARIO_CANCELAMENTO FROM ATENDIMENTO_PACIENTE WHERE NR_ATENDIMENTO = :idAtendimento`

export const selectNrPrescricao = `SELECT NR_PRESCRICAO FROM PRESCR_MEDICA WHERE NR_ATENDIMENTO = :idAtendimento`

export const selectSequenciaInterna = `SELECT NR_SEQ_INTERNO FROM PRESCR_PROCEDIMENTO WHERE NR_PRESCRICAO = :nrPrescricao`

export const selectCodigoPessoaFisica = `SELECT cd_pessoa_fisica FROM PRESCR_MEDICA WHERE NR_ATENDIMENTO = :atendimentoId`

export const selectDadosPaciente = `SELECT NM_PESSOA_FISICA, dt_nascimento, ie_sexo, nr_cpf FROM PESSOA_FISICA WHERE cd_pessoa_fisica = :codigoPessoa`