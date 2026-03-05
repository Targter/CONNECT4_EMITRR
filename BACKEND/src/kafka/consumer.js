import { kafka } from "../config/kafka.js";
import Analytics from "../models/Analytics.js";

const consumer = kafka.consumer({ groupId: "analytics-group" });

export const startConsumer = async () => {
  try {
    await consumer.connect();
    // fromBeginning: false ensures we don't re-process old events
    await consumer.subscribe({
      topic: "connect4-events",
      fromBeginning: false,
    });

    console.log("Kafka Analytics Consumer running...");

    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const payload = JSON.parse(message.value.toString());
          console.log("Received Event:", payload.event, "| Payload:", payload);
          const p2Name =
            payload.players?.[1]?.username ||
            payload.players?.[1] ||
            payload.player2 ||
            "";
          console.log("Player 2 Name for Bot Detection:", p2Name);
          const p2 = p2Name.toLowerCase();

          const isBot =
            payload.isBotGame === true ||
            payload.gameType === "bot" ||
            payload.mode === "pve" ||
            p2 === "bot" ||
            p2.includes("bot") ||
            p2.includes("cpu") ||
            p2.includes("ai");
          console.log("isBotGame:", isBot, "| Player2 Name:", p2Name);
          // Time keys
          const now = new Date();
          const currentHour = now.getHours().toString(); // "14"
          const currentDay = now.toISOString().split("T")[0]; // "2026-03-06"

          // Update Object
          const update = { $inc: {}, $max: {}, $min: {} };
          let shouldUpdateDB = false;

          // ============================================
          // EVENT: GAME START
          // ============================================
          if (
            payload.event === "gameStart" ||
            payload.event === "game_started"
          ) {
            shouldUpdateDB = true;
            update.$inc["totalGames"] = 1;
            update.$inc["activeGames"] = 1;
            update.$inc[`gamesPerHour.${currentHour}`] = 1;
            update.$inc[`gamesPerDay.${currentDay}`] = 1;

            if (isBot) {
              console.log("--> Detected BOT Game Start");
              update.$inc["botGamesPlayed"] = 1;
            }
          }

          // ============================================
          // EVENT: MOVE MADE
          // ============================================
          else if (
            payload.event === "makeMove" ||
            payload.event === "move_made"
          ) {
            shouldUpdateDB = true;
            update.$inc["totalMoves"] = 1;
            update.$inc[`movesPerHour.${currentHour}`] = 1;
          }

          // ============================================
          // EVENT: GAME OVER
          // ============================================
          else if (
            payload.event === "gameOver" ||
            payload.event === "game_finished"
          ) {
            shouldUpdateDB = true;
            update.$inc["activeGames"] = -1;
            update.$inc["totalFinishedGames"] = 1;

            // Handle Duration
            if (typeof payload.duration === "number") {
              update.$inc["totalGameDuration"] = payload.duration;
              update.$max["longestGame"] = payload.duration;
              update.$min["shortestGame"] = payload.duration;
            }

            // Handle Winner
            if (payload.winner) {
              if (payload.winner === "draw") {
                update.$inc["draws"] = 1;
              } else {
                // Logic: Did Player 1 win?
                const p1Name =
                  payload.players?.[0]?.username ||
                  payload.players?.[0] ||
                  payload.player1 ||
                  "";
                const p1Won = payload.winner === p1Name;

                if (p1Won) {
                  update.$inc["player1Wins"] = 1;
                  // If P1 won against a bot, the Bot Lost
                  if (isBot) update.$inc["botLosses"] = 1;
                } else {
                  update.$inc["player2Wins"] = 1;
                  // If P2 won and it's a bot game, the Bot Won
                  if (isBot) update.$inc["botWins"] = 1;
                }
              }
            }
          }

          // ============================================
          // EVENT: DISCONNECTS
          // ============================================
          else if (
            payload.event === "playerDisconnected" ||
            payload.event === "disconnect"
          ) {
            shouldUpdateDB = true;
            console.log("--> Detected Disconnect");
            update.$inc["disconnects"] = 1;
          } else if (
            payload.event === "playerReconnected" ||
            payload.event === "reconnect"
          ) {
            shouldUpdateDB = true;
            update.$inc["reconnects"] = 1;
          }

          // ============================================
          // EXECUTE UPDATE
          // ============================================
          if (shouldUpdateDB) {
            // Clean empty operators
            if (Object.keys(update.$max).length === 0) delete update.$max;
            if (Object.keys(update.$min).length === 0) delete update.$min;

            await Analytics.findByIdAndUpdate("global_metrics", update, {
              upsert: true,
              returnDocument: "after",
            });
          }
        } catch (err) {
          console.error("Analytics Processing Error:", err);
        }
      },
    });
  } catch (error) {
    console.error("Kafka Consumer Error:", error);
  }
};
