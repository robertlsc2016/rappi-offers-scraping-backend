import express from "express";
import cors from "cors";
import https from "https";
import fs from "fs";
import os from "os";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { router as storeRouter } from "./Routes/storeRoutes";
import { StoreService } from "./services/storeService";
import runCronJobs from "./crons/test-cron";
import swaggerDocument from "./swagger/swagger-output.json";

dotenv.config();

const PORT = 3000;
const app = express();

// Middlewares globais
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Documentação Swagger
const swaggerOptions = { explorer: true };
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, swaggerOptions)
);

// Rotas
app.use("/store", storeRouter);

// Inicializações
StoreService.addStores();
runCronJobs();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

if (os.platform() == "linux") {
  const sslOptions = {
    key: fs.readFileSync(process.env.PRIVATE_KEY || ""),
    cert: fs.readFileSync(process.env.CERT || ""),
    ca: fs.readFileSync(process.env.CHAIN || ""),
  };

  https.createServer(sslOptions, app).listen(PORT, "0.0.0.0", () => {
    console.log(
      `Servidor HTTPS rodando em https://${process.env.HOST}`
    );
  });
}

if (os.platform() == "win32") {
  app.listen(PORT, "0.0.0.0", () => {
    console.log("API documentation: http://localhost:3000/api-docs");
    console.log(`API rodando na porta http://localhost:${PORT}`);
  });
}
