// import { Kafka } from "kafkajs";
// console.log("KAFKA BROKER:", process.env.KAFKA_BROKER);
// export const kafka = new Kafka({
//   clientId: "connect4-analytics",
//   brokers: [process.env.KAFKA_BROKER],
// });

import { Kafka } from "kafkajs";
import fs from "fs";
import path from "path";

// Resolve the path to the certs folder (assuming you run npm start from the backend folder)
const certsDir = path.resolve(process.cwd(), "certs");
console.log("Looking for certs in:", certsDir);

// Check if Aiven broker URL is provided
const broker = process.env.KAFKA_BROKER;

if (!broker) {
  console.warn(
    "⚠️ AIVEN_KAFKA_BROKER not found in .env. Falling back to local Kafka.",
  );
}

export const kafka = new Kafka({
  clientId: "kafka-2727c577",
  // Use Aiven broker if available, otherwise fallback to local Docker Kafka
  brokers: [broker || "localhost:9092"],

  // If using Aiven, we MUST apply SSL configurations
  ...(broker && {
    ssl: {
      rejectUnauthorized: true,
      ca: [fs.readFileSync(path.join(certsDir, "ca.pem"), "utf-8")],
      key: fs.readFileSync(path.join(certsDir, "service.key"), "utf-8"),
      cert: fs.readFileSync(path.join(certsDir, "service.cert"), "utf-8"),
    },
  }),
});
