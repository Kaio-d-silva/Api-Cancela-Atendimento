// Bibliotecas
import { ENV } from "./config/env";

// Função para iniciar o servidor em uma porta específica
const startServer = async (port: number) => {
  const app = (await import("./config/app")).default;
  
  app
    .listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
      console.log(
        `Documentação da API disponível em http://localhost:${port}/api-docs`
      );
    })
    .on("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        console.log(`Porta ${port} está ocupada.`);
      } else {
        console.error(err);
      }
    });
};

startServer(Number(ENV.PORT));
