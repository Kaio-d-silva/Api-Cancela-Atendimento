# --- Etapa 1: build ---
FROM node:18-slim AS build

RUN apt-get update && apt-get install -y \
    libaio1 \
    libaio-dev \
    unzip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /api

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# --- Etapa 2: runtime (final) ---
FROM node:18-slim

RUN apt-get update && apt-get install -y \
    libaio1 \
    unzip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /api

COPY --from=build /api ./

# Define Oracle Client
ENV LD_LIBRARY_PATH=/api/oracle/instantclient_19_28
ENV PATH=$LD_LIBRARY_PATH:$PATH

EXPOSE 3000

CMD ["npm", "start"]
