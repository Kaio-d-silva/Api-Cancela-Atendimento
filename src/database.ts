import oracledb from 'oracledb';
import { ENV } from './config/env';

oracledb.initOracleClient({ libDir: '/home/Desenvolvimento/api/oracle/instantclient_19_28' });
// oracledb.initOracleClient({ libDir: '/api/oracle/instantclient_19_28' });


export async function getConnectionTasyHom() {
  console.log("!!!!!!!!!!!!!!!!!!!!!!! Homologação !!!!!!!!!!!!!!!!!!!!!!!")
  return await oracledb.getConnection({
    user: ENV.USER_DB_TASY_HOMO,        
    password: ENV.PASSWORD_DB_TASY_HOMO,
    connectString: ENV.CONNECT_STRING_TASY_HOMO 

  });
}

export async function getConnectionTasyProd() {
  return await oracledb.getConnection({
    user: ENV.USER_DB_TASY_PROD,       
    password: ENV.PASSWORD_DB_TASY_PROD,   
    connectString: ENV.CONNECT_STRING_TASY_PROD

  });
}

export async function getConnectionPacs() {
  return await oracledb.getConnection({
    user: ENV.USER_DB_PACS,         
    password: ENV.PASSWORD_DB_PACS,     
    connectString: ENV.CONNECT_STRING_PACS
  });
}

export async function getConnectionPacsMedlink() {
  return await oracledb.getConnection({
    user: ENV.USER_DB_PACS_MEDLINK,         
    password: ENV.PASSWORD_DB_PACS_MEDLINK,     
    connectString: ENV.CONNECT_STRING_PACS_MEDLINK
  });
}


