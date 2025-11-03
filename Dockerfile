FROM node:18

# Instala dependências do sistema necessárias para o Oracle
RUN apt-get update && apt-get install -y libaio1 unzip && rm -rf /var/lib/apt/lists/*

# Cria diretório da aplicação
WORKDIR /api

# Copia o código da aplicação
COPY . .

# Define o local do Oracle Instant Client dentro do container
ENV LD_LIBRARY_PATH=/api/oracle/instantclient_19_28
ENV PATH=$LD_LIBRARY_PATH:$PATH

# Instala dependências Node
RUN npm install

EXPOSE 5002

CMD ["npm", "start"]
