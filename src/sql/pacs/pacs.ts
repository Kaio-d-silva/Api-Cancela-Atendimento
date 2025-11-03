export const selectAcessionNumber = 'SELECT ACCESSION_NUMBER FROM DIDB_STUDIES WHERE ACCESSION_NUMBER = :accessionNumber';

export const selectMedicosPacs = `SELECT
    S.LOGIN_ID,
    S.STATUS,
    SP.NAME_GIVEN || ' ' || SP.NAME_FAMILY AS USER_NAME,
    G.GROUP_NAME,
    SITE.SITE_ID
FROM MEDILINK.SECM_USERS S
JOIN MEDILINK.SECM_PERSON_DETAILS SP 
    ON SP.DBID = S.DBID
JOIN MEDILINK.SECM_GROUPS G 
    ON G.DBID = S.SECURITY_GROUP_ID
LEFT JOIN (
    SELECT 
        SUBSTR(
            REPLACE(C.PATH_SEGMENT, 'imaginet' || CHR(92) || 'users' || CHR(92), ''), 
            1, 
            INSTR(REPLACE(C.PATH_SEGMENT, 'imaginet' || CHR(92) || 'users' || CHR(92), ''), CHR(92)) - 1
        ) AS USERS,
        C.VALUE AS SITE_ID
    FROM CFG.CFG_REPOSITORY C 
    WHERE C.PATH_SEGMENT LIKE '%access_filter%' 
      AND C.VALUE IS NOT NULL
      AND C.PATH_SEGMENT LIKE '%tamar_site_id%'
) SITE 
    ON LOWER(SITE.USERS) = LOWER(S.LOGIN_ID)
WHERE LOWER(G.GROUP_NAME) IN ('radiologists', 'revisao_mascara')
  AND S.STATUS = 'ACTIVE'
ORDER BY USER_NAME`
