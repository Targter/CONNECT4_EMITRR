import { kafka } from "../config/kafka.js";
const consumer = kafka.consumer({ groupId: "analytics-group" });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "connect4-events", fromBeginning: true });
  console.log("Kafka Analytics Consumer running...");
  await consumer.run({
    eachMessage: async ({ message }) => {
      const data = JSON.parse(message.value.toString());
      console.log(`[ANALYTICS] ${data.event}:`, data);
      // Connect to DB here if computing long-term aggregate data metrics
    },
  });
};
run().catch(console.error);
