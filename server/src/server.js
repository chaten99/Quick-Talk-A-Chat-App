import cluster from "cluster";
import os from "os";
import http from "http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import { env } from "./config/env.js";
import { initSocket } from "./sockets/socket.js";

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  const start = async () => {
    await connectDB();
    await connectRedis();

    const httpServer = http.createServer(app);
    await initSocket(httpServer);

    httpServer.listen(env.PORT, () => {
      console.log(`Server running on ${env.PORT}`);
    });
  };

  start();
}