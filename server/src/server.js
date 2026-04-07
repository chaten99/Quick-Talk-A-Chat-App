import cluster from "cluster";
import os from "os";
import http from "http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import { env } from "./config/env.js";
import { initSocket } from "./sockets/socket.js";

const numCPUs = os.cpus().length;
const shouldUseCluster = env.NODE_ENV === "production";
const workerCount = shouldUseCluster ? numCPUs : 1;

const start = async () => {
  await connectDB();
  await connectRedis();

  const httpServer = http.createServer(app);
  await initSocket(httpServer);

  httpServer.listen(env.PORT, () => {
    console.log(`Server running on ${env.PORT}`);
  });
};

if (shouldUseCluster && cluster.isPrimary) {
  console.log(`Primary running`);

  for (let i = 0; i < workerCount; i++) {
    cluster.fork();
  }
} else {
  start();
}
