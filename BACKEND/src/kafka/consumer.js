// // // // import { kafka } from "../config/kafka.js";
// // // // const consumer = kafka.consumer({ groupId: "analytics-group" });

// // // // const run = async () => {
// // // //   await consumer.connect();
// // // //   await consumer.subscribe({ topic: "connect4-events", fromBeginning: true });
// // // //   console.log("Kafka Analytics Consumer running...");
// // // //   await consumer.run({
// // // //     eachMessage: async ({ message }) => {
// // // //       const data = JSON.parse(message.value.toString());
// // // //       console.log(`[ANALYTICS] ${data.event}:`, data);
// // // //       // Connect to DB here if computing long-term aggregate data metrics
// // // //     },
// // // //   });
// // // // };
// // // // run().catch(console.error);

// // // import { kafka } from "../config/kafka.js";
// // // import Analytics from "../models/Analytics.js";
// // // const consumer = kafka.consumer({ groupId: "analytics-group" });

// // // // 1. Export the function (renamed to startConsumer for clarity)
// // // export const startConsumer = async () => {
// // //   try {
// // //     await consumer.connect();
// // //     // Keeping your topic name "connect4-events"
// // //     await consumer.subscribe({ topic: "connect4-events", fromBeginning: true });
// // //     console.log("Kafka Analytics Consumer running securely in background...");

// // //     await consumer.run({
// // //       eachMessage: async ({ message }) => {
// // //         // const payload = JSON.parse(message.value.toString());
// // //         const data = JSON.parse(message.value.toString());
// // //         console.log(`[ANALYTICS] ${data.event}:`, data);
// // //       },
// // //     });

// // //     try {
// // //       await Analytics.create({
// // //         event: data.event,
// // //         data: data, // Saves the gameId, playerId, col, etc.
// // //         timestamp: new Date(data.timestamp || Date.now()),
// // //       });
// // //       console.log(`[DB] Successfully saved ${data.event} to MongoDB`);
// // //     } catch (dbError) {
// // //       console.error("[DB ERROR] Failed to save analytics event:", dbError);
// // //     }
// // //   } catch (error) {
// // //     console.error("Kafka Consumer Error:", error);
// // //   }
// // // };

// // // // 2. We removed the "run().catch(console.error);" from the bottom!

// // import { kafka } from "../config/kafka.js";
// // import Analytics from "../models/Analytics.js";

// // const consumer = kafka.consumer({ groupId: "analytics-group" });

// // export const startConsumer = async () => {
// //   try {
// //     await consumer.connect();

// //     await consumer.subscribe({
// //       topic: "connect4-events",
// //       fromBeginning: true,
// //     });

// //     console.log("Kafka Analytics Consumer running securely in background...");

// //     await consumer.run({
// //       eachMessage: async ({ message }) => {
// //         try {
// //           const data = JSON.parse(message.value.toString());

// //           console.log(`[ANALYTICS] ${data.event}:`, data);

// //           await Analytics.create({
// //             event: data.event,
// //             data: data,
// //             timestamp: new Date(data.timestamp || Date.now()),
// //           });

// //           console.log(`[DB] Successfully saved ${data.event} to MongoDB`);
// //         } catch (err) {
// //           console.error("Error processing message:", err);
// //         }
// //       },
// //     });
// //   } catch (error) {
// //     console.error("Kafka Consumer Error:", error);
// //   }
// // };

// import { kafka } from "../config/kafka.js";
// import Analytics from "../models/Analytics.js";

// const consumer = kafka.consumer({ groupId: "analytics-group" });

// export const startConsumer = async () => {
//   try {
//     await consumer.connect();

//     await consumer.subscribe({
//       topic: "connect4-events",
//       fromBeginning: false, // prevent reprocessing all old events
//     });

//     console.log("Kafka Analytics Consumer running...");

//     await consumer.run({
//       eachMessage: async ({ message }) => {
//         try {
//           const payload = JSON.parse(message.value.toString());

//           console.log(`[ANALYTICS EVENT] ${payload.event}`, payload);

//           let updateQuery = { $inc: {} };

//           // 1️⃣ GAME STARTED
//           if (payload.event === "game_started") {
//             updateQuery.$inc.totalGames = 1;
//             updateQuery.$inc.activeGames = 1;
//           }

//           // 2️⃣ MOVE MADE
//           else if (payload.event === "move_made") {
//             updateQuery.$inc.totalMoves = 1;
//           }

//           // 3️⃣ GAME FINISHED
//           else if (payload.event === "game_finished") {
//             updateQuery.$inc.activeGames = -1;

//             if (payload.winner && payload.winner !== "draw") {
//               if (payload.isPlayer1Win) {
//                 updateQuery.$inc.player1Wins = 1;
//               } else {
//                 updateQuery.$inc.player2Wins = 1;
//               }
//             }
//           }

//           // If nothing to update, skip
//           if (Object.keys(updateQuery.$inc).length === 0) return;

//           await Analytics.findOneAndUpdate(
//             { _id: "global_metrics" },
//             updateQuery,
//             {
//               upsert: true,
//               new: true,
//             },
//           );

//           console.log(`[DB] Analytics updated for ${payload.event}`);
//         } catch (err) {
//           console.error("Consumer processing error:", err);
//         }
//       },
//     });
//   } catch (error) {
//     console.error("Kafka Consumer Startup Error:", error);
//   }
// };

import { kafka } from "../config/kafka.js";
import Analytics from "../models/Analytics.js";

const consumer = kafka.consumer({ groupId: "analytics-group" });

export const startConsumer = async () => {
  try {
    await consumer.connect();
    // Subscribe from beginning to catch missed data, or false to only get new
    await consumer.subscribe({
      topic: "connect4-events",
      fromBeginning: false,
    });

    console.log("Kafka Analytics Consumer running...");

    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const payload = JSON.parse(message.value.toString());
          // console.log(`[ANALYTICS EVENT] ${payload.event}`);

          // 1. Prepare Time Keys
          const now = new Date();
          const currentHour = now.getHours().toString(); // "14"
          const currentDay = now.toISOString().split("T")[0]; // "2026-03-06"

          const updateOps = { $inc: {}, $max: {}, $min: {} };

          // --- EVENT: GAME STARTED ---
          if (payload.event === "game_started") {
            updateOps.$inc["totalGames"] = 1;
            updateOps.$inc["activeGames"] = 1;

            // Map Updates: Use dot notation for nested Map fields
            updateOps.$inc[`gamesPerHour.${currentHour}`] = 1;
            updateOps.$inc[`gamesPerDay.${currentDay}`] = 1;

            if (payload.isBotGame) {
              updateOps.$inc["botGamesPlayed"] = 1;
            }
          }

          // --- EVENT: MOVE MADE ---
          else if (payload.event === "move_made") {
            updateOps.$inc["totalMoves"] = 1;
            updateOps.$inc[`movesPerHour.${currentHour}`] = 1;
          }

          // --- EVENT: GAME FINISHED ---
          else if (payload.event === "game_finished") {
            updateOps.$inc["activeGames"] = -1;
            updateOps.$inc["totalFinishedGames"] = 1;

            // Handle Winner
            if (payload.winner === "draw") {
              updateOps.$inc["draws"] = 1;
            } else if (payload.winner) {
              // Assuming payload.winner contains username, logic depends on how you track P1 vs P2
              // Simpler approach if payload tells us who won:
              if (payload.playerId === payload.player1Id)
                updateOps.$inc["player1Wins"] = 1;
              else updateOps.$inc["player2Wins"] = 1;

              // Bot Logic
              if (payload.isBotGame) {
                if (payload.winner === "CPU_BOT") updateOps.$inc["botWins"] = 1;
                else updateOps.$inc["botLosses"] = 1;
              }
            }

            // Duration Logic (Expects payload.duration in ms)
            if (payload.duration) {
              updateOps.$inc["totalGameDuration"] = payload.duration;
              updateOps.$max["longestGame"] = payload.duration;
              updateOps.$min["shortestGame"] = payload.duration;
            }
          }

          // --- EVENT: CONNECTIONS ---
          else if (payload.event === "player_disconnected") {
            updateOps.$inc["disconnects"] = 1;
          } else if (payload.event === "player_reconnected") {
            updateOps.$inc["reconnects"] = 1;
          }

          // Execute DB Update if there are changes
          if (
            Object.keys(updateOps.$inc).length > 0 ||
            Object.keys(updateOps.$max).length > 0
          ) {
            // Remove empty operators to prevent Mongo errors
            if (Object.keys(updateOps.$max).length === 0) delete updateOps.$max;
            if (Object.keys(updateOps.$min).length === 0) delete updateOps.$min;
            // console.log("updatedfinalupdatedoperatiosn:", updateOps);
            await Analytics.findByIdAndUpdate("global_metrics", updateOps, {
              upsert: true,
              new: true,
            });
            // console.log(`[DB] Updated metrics for ${payload.event}`);
          }
        } catch (err) {
          console.error("Error processing analytics message:", err);
        }
      },
    });
  } catch (error) {
    console.error("Kafka Consumer Error:", error);
  }
};
