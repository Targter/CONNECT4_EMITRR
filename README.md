# 🔴🟡 Real-Time Connect4 Backend with Event Streaming Analytics

> A production-grade backend system powering real-time Connect4 gameplay, with Kafka-based event streaming and asynchronous analytics processing.

[![Live Demo](https://img.shields.io/badge/🎮%20Live%20Demo-emitrr.abhaybansal.site-brightgreen?style=for-the-badge)](https://emitrr.abhaybansal.site)
[![GitHub Repo](https://img.shields.io/badge/GitHub-CONNECT4__EMITRR-181717?style=for-the-badge&logo=github)](https://github.com/Targter/CONNECT4_EMITRR)
[![Portfolio](https://img.shields.io/badge/Portfolio-abhaybansal.in-0A66C2?style=for-the-badge&logo=internet-explorer&logoColor=white)](https://abhaybansal.in)

---

## 📌 Project Overview

This project is a full-stack backend system built to support real-time Connect4 gameplay while capturing and analyzing player behavior through an event-driven architecture.

Every gameplay action — from starting a game to placing a piece — is recorded as a structured event and published to a **Kafka topic**. A dedicated **analytics consumer** processes these events asynchronously, enabling scalable, decoupled data pipelines without impacting the core game experience.

The system is designed with **distributed systems principles** in mind: loose coupling, horizontal scalability, and resilience across services.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│                  React Frontend (Game UI)                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP / REST
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     GAME BACKEND API                            │
│              Java / Spring Boot Application                     │
│                                                                 │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐   │
│   │  Controller  │ → │   Service    │ → │  Kafka Producer  │   │
│   └──────────────┘   └──────────────┘   └──────────────────┘   │
│                             │                                   │
│                             ▼                                   │
│                    ┌─────────────────┐                          │
│                    │  Game Database  │                          │
│                    │  (MySQL/MongoDB)│                          │
│                    └─────────────────┘                          │
└──────────────────────────────────┬──────────────────────────────┘
                                   │ Publishes Events
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                   KAFKA EVENT STREAMING                         │
│                  (Aiven Kafka Cloud)                            │
│                                                                 │
│              Topic: connect4-events                             │
│         ┌────────────────────────────────┐                      │
│         │  game_started | move_made      │                      │
│         │  game_finished | player_joined │                      │
│         └────────────────────────────────┘                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Consumes Events
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ANALYTICS CONSUMER                            │
│                   (Node.js Service)                             │
│                                                                 │
│   ┌──────────────────┐       ┌──────────────────────────────┐   │
│   │   consumer.js    │   →   │    analyticsService.js       │   │
│   └──────────────────┘       └──────────────────────────────┘   │
│                                          │                      │
│                                          ▼                      │
│                               ┌─────────────────┐              │
│                               │ Analytics Store │              │
│                               │ (MongoDB/MySQL) │              │
│                               └─────────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

- ♟️ **Real-Time Connect4 Gameplay** — RESTful API driving game state management and move validation
- ⚡ **Event-Driven Architecture** — Gameplay actions trigger structured events, fully decoupled from analytics
- 📨 **Kafka-Based Event Streaming** — High-throughput, fault-tolerant event pipeline via Apache Kafka
- 📊 **Asynchronous Analytics Processing** — Analytics consumer processes events independently without blocking game flow
- 📈 **Scalable Backend Architecture** — Designed for horizontal scaling across all service layers
- ☁️ **Cloud Deployment Ready** — Configured for seamless deployment on Render with Aiven Kafka

---

## 🛠️ Tech Stack

| Layer                  | Technology               |
| ---------------------- | ------------------------ |
| **Backend API**        | Java 17, Spring Boot 3.x |
| **Messaging**          | Apache Kafka             |
| **Streaming SaaS**     | Aiven Kafka (Cloud)      |
| **Database**           | MySQL / MongoDB          |
| **Analytics Consumer** | Node.js                  |
| **Frontend**           | React                    |
| **Deployment**         | Render                   |
| **Build Tool**         | Maven                    |

---

## 📡 Event Streaming with Kafka

### Why Kafka?

Kafka provides a durable, distributed message log that decouples the **game backend** from **analytics processing**. Rather than writing analytics logic directly into the game service, every meaningful action is published as an event. This means:

- The game API stays fast and focused
- Analytics can be added, changed, or replayed without touching game logic
- The system handles traffic spikes gracefully

### How Events Are Produced

When a player takes an action, the Spring Boot backend calls the `KafkaProducer` service, which serializes the event as JSON and publishes it to the `connect4-events` topic.

```java
// Example: Publishing a move event
kafkaTemplate.send("connect4-events", MoveEvent.builder()
    .eventType("move_made")
    .gameId(gameId)
    .playerId(playerId)
    .column(column)
    .timestamp(Instant.now())
    .build());
```

### How Consumers Process Analytics

The Node.js analytics consumer subscribes to the `connect4-events` topic. On each message, it routes the event to the appropriate handler in `analyticsService.js`, which aggregates and persists analytics data — e.g., move frequency, game duration, win rates.

### Event Types

| Event           | Trigger                          |
| --------------- | -------------------------------- |
| `game_started`  | A new game session is created    |
| `move_made`     | A player places a piece          |
| `game_finished` | A win, loss, or draw is detected |
| `player_joined` | A player joins a game lobby      |

---

## 📬 Kafka Topic Structure

**Topic Name:** `connect4-events`

**Partitions:** 3 | **Replication Factor:** 2 (cloud default)

### Example Event Message

```json
{
  "eventType": "move_made",
  "gameId": "game-8f3a1c29",
  "playerId": "player-42",
  "playerColor": "RED",
  "column": 3,
  "boardState": "[[0,0,0],[0,1,0],[0,2,1]]",
  "moveNumber": 7,
  "timestamp": "2025-03-05T14:32:10.421Z"
}
```

```json
{
  "eventType": "game_finished",
  "gameId": "game-8f3a1c29",
  "winnerId": "player-42",
  "winnerColor": "RED",
  "totalMoves": 21,
  "durationSeconds": 184,
  "timestamp": "2025-03-05T14:35:14.102Z"
}
```

---

## 📁 Project Structure

```
connect4-backend/
│
├── backend/                        # Spring Boot Game API
│   ├── src/main/java/
│   │   ├── controller/             # REST controllers (GameController)
│   │   ├── service/                # Game logic (GameService)
│   │   ├── kafka/                  # Kafka producer setup
│   │   │   ├── KafkaProducer.java
│   │   │   └── EventPublisher.java
│   │   ├── model/                  # Domain models (Game, Player, Move)
│   │   ├── repository/             # DB access layer
│   │   └── config/                 # Kafka, DB, CORS configuration
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
├── analytics-consumer/             # Node.js Kafka Consumer
│   ├── consumer.js                 # Kafka subscription & message routing
│   ├── analyticsService.js         # Analytics aggregation logic
│   ├── db.js                       # Analytics DB connection
│   ├── package.json
│   └── .env.example
│
├── frontend/                       # React Frontend
│   ├── src/
│   │   ├── components/             # Board, Cell, GameStatus
│   │   ├── hooks/                  # useGameState, usePlayer
│   │   ├── services/               # API client (axios)
│   │   └── App.jsx
│   └── package.json
│
├── docker-compose.yml              # Local Kafka + DB setup (optional)
├── .env.example
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint           | Description                  |
| ------ | ------------------ | ---------------------------- |
| `POST` | `/game/start`      | Start a new game session     |
| `POST` | `/game/move`       | Submit a player move         |
| `GET`  | `/game/state/{id}` | Retrieve current board state |
| `GET`  | `/game/history`    | Fetch completed games list   |
| `POST` | `/game/forfeit`    | Forfeit the current game     |

### Example Request — Start Game

```bash
POST /game/start
Content-Type: application/json

{
  "player1Id": "player-42",
  "player2Id": "player-99"
}
```

### Example Response

```json
{
  "gameId": "game-8f3a1c29",
  "status": "IN_PROGRESS",
  "currentTurn": "player-42",
  "board": [[0,0,0,0,0,0,0], ...]
}
```

---

## 🔄 How Kafka Works in This System

```
Player Submits Move
        │
        ▼
  POST /game/move
  (Spring Boot API)
        │
        ├──→ Validate move & update game state
        ├──→ Persist to Game Database
        │
        ▼
  KafkaProducer.publish("move_made", eventPayload)
        │
        ▼
  Kafka Topic: connect4-events
        │
        ▼
  Analytics Consumer (Node.js)
  consumer.js → analyticsService.js
        │
        ▼
  Aggregate & persist to Analytics Database
  (move counts, session duration, win rates...)
```

The game API and analytics consumer operate **independently** — a consumer outage has zero impact on gameplay. Events are durably stored in Kafka and replayed once the consumer recovers.

---

## ☁️ Deployment

The backend is deployed on **[Render](https://render.com)** with **[Aiven](https://aiven.io)** providing managed Kafka infrastructure.

### Steps to Deploy

**1. Connect GitHub Repository**

- Log in to Render → New Web Service → Connect your GitHub repo

**2. Configure Environment Variables**

```env
SPRING_KAFKA_BOOTSTRAP_SERVERS=<aiven-kafka-host>:port
KAFKA_SECURITY_PROTOCOL=SSL
KAFKA_SSL_TRUSTSTORE_LOCATION=/certs/ca.p12
KAFKA_SSL_KEYSTORE_LOCATION=/certs/service.p12
KAFKA_SSL_KEYSTORE_PASSWORD=<your-password>
DB_URL=<your-database-url>
DB_USERNAME=<username>
DB_PASSWORD=<password>
```

**3. Deploy the Backend Service**

- Build command: `mvn clean package -DskipTests`
- Start command: `java -jar target/connect4-backend.jar`

**4. Deploy the Analytics Consumer**

- Separate Render service (Node.js)
- Configure identical Kafka credentials in environment

---

## 🚀 Running the Project Locally

### Prerequisites

- Java 17+
- Node.js 18+
- Docker (for local Kafka)
- Maven

### 1. Clone the Repository

```bash
git clone https://github.com/Targter/CONNECT4_EMITRR.git
cd CONNECT4_EMITRR
```

### 2. Start Local Kafka (Docker)

```bash
docker-compose up -d
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
# Fill in your local Kafka and DB credentials
```

### 4. Run the Backend Server

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### 5. Run the Analytics Consumer

```bash
cd analytics-consumer
npm install
node consumer.js
```

### 6. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The game will be available at `http://localhost:5173` and the API at `http://localhost:8080`.

---

## 🔮 Future Improvements

| Feature                                   | Description                                                           |
| ----------------------------------------- | --------------------------------------------------------------------- |
| 📊 **Real-Time Analytics Dashboard**      | Live charts tracking game stats, move heatmaps, and session analytics |
| 🏆 **Leaderboard System**                 | Ranked player leaderboard with ELO-style scoring                      |
| 🔴 **WebSocket Live Updates**             | Replace polling with WebSocket connections for real-time board sync   |
| ⚙️ **Kafka Partition Optimization**       | Partition by `gameId` for ordered event processing per game session   |
| 📈 **Monitoring with Prometheus/Grafana** | Kafka consumer lag, API latency, and event throughput dashboards      |
| 🧪 **Integration Test Suite**             | End-to-end tests for Kafka event flow and game state transitions      |
| 🔐 **Auth & Player Sessions**             | JWT-based authentication and persistent player profiles               |

---

## 📚 Learning Outcomes

This project demonstrates practical experience with:

- **Event-Driven Architecture** — Designing systems where services communicate through events rather than direct calls, enabling true decoupling
- **Distributed Systems Concepts** — Producer/consumer patterns, message durability, and fault-tolerant pipelines
- **Apache Kafka** — Topic configuration, producer APIs, consumer groups, offset management, and SSL-secured cloud Kafka
- **Backend Scalability** — Stateless API design that scales horizontally, with async processing offloaded to consumers
- **Cloud-Native Deployment** — Environment-based configuration, managed services (Aiven), and PaaS deployment (Render)

---

## 👤 Author

**Abhay Bansal**

[![Portfolio](https://img.shields.io/badge/Portfolio-abhaybansal.in-FF5722?style=for-the-badge&logo=internet-explorer&logoColor=white)](https://abhaybansal.in)
[![GitHub](https://img.shields.io/badge/GitHub-Targter-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Targter)
[![Live Project](https://img.shields.io/badge/🎮%20Live%20Project-emitrr.abhaybansal.site-brightgreen?style=for-the-badge)](https://emitrr.abhaybansal.site)

---

_Built to explore event-driven backend design, distributed systems, and real-time data pipelines._
