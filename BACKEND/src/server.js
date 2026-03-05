import dotenv from "dotenv";
dotenv.config();
console.log("ENV CHECK:", process.env.MONGO_URI);
console.log("ENV CHECK KAFKA:", process.env.KAFKA_BROKER);



import { connectDB } from "./config/db.js";
import app from "./app.js";
import { Server } from "socket.io";
import http from "http";
import { connectProducer } from "./kafka/producer.js";
import { setupSockets } from "./sockets/gameSocket.js";
console.log(process.env.MONGO_URI);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

setupSockets(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await connectDB();
  await connectProducer();
});
