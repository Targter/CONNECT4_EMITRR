import { kafka } from "../config/kafka.js";
const producer = kafka.producer();
let connected = false;

export const connectProducer = async () => {
  try {
    await producer.connect();
    connected = true;
    console.log("Kafka Producer connected");
  } catch (e) {
    console.warn("Kafka unavailable. Skipping analytics.");
  }
};

export const emitEvent = async (event, data) => {
  if (!connected) return;
  try {
    await producer.send({
      topic: "connect4-events",
      messages: [
        {
          key: event,
          value: JSON.stringify({ event, ...data, timestamp: Date.now() }),
        },
      ],
    });
  } catch (e) {
    console.error("Kafka emit error:", e);
  }
};
