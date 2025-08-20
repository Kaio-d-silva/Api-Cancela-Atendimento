import oracledb from 'oracledb';

async function getConnection() {
  return await oracledb.getConnection({
    user: "local",         // usuário que você criou no Oracle
    password: "123",     // senha do usuário
    connectString: "localhost:1521/XEPDB1" // string de conexão do Oracle
  });
}

export default getConnection;

