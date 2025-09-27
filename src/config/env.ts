import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Exporta as variáveis de ambiente para uso em todo o projeto
export const ENV = {
PORT: process.env.PORT || '3000',

USER_DB_TASY_PROD :process.env.USER_DB_TASY_PROD,
PASSWORD_DB_TASY_PROD :process.env.PASSWORD_DB_TASY_PROD,
CONNECT_STRING_TASY_PROD :process.env.CONNECT_STRING_TASY_PROD,
 
USER_DB_TASY_HOMO :process.env.USER_DB_TASY_HOMO,
PASSWORD_DB_TASY_HOMO :process.env.PASSWORD_DB_TASY_HOMO,
CONNECT_STRING_TASY_HOMO :process.env.CONNECT_STRING_TASY_HOMO,
 
USER_DB_PACS :process.env.USER_DB_PACS,
PASSWORD_DB_PACS :process.env.PASSWORD_DB_PACS,
CONNECT_STRING_PACS :process.env.CONNECT_STRING_PACS,
};