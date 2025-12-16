# BPMN Real-Time Collaboration Challenge

**Live Demo:**  
👉 https://summai-challenge.ghassen-jebbari.de/

---

## Overview

This project is a minimal real-time collaborative BPMN diagram editor built as part of the **SUMM AI take-home challenge**.  
It uses **bpmn-js** on the frontend and a WebSocket-based backend to synchronize BPMN diagrams between multiple connected users in real time.  

The focus of this implementation is simplicity, clarity, and correctness of the real-time flow rather than full collaborative editing guarantees.

---

## Features

- Render and edit BPMN diagrams in the browser using **bpmn-js**  
- Real-time diagram updates via WebSockets  
- Online users indicator  
- Element-level locking with visual markers  
- Prevent interaction with elements locked by other users  

---

## Known Limitations (Work in Progress)

- Concurrent edits are **not conflict-safe**  
- Diagram updates are applied as full XML replacements  
- Changes can be overwritten if multiple users edit at the same time  
- No merge or conflict-resolution logic is implemented yet  

These limitations are known and currently under active consideration for future improvements.

---

## Tech Stack

- **Frontend:** React, TypeScript, bpmn-js, Mantine UI  
- **Backend:** FastAPI (Python), WebSockets  
- **Infrastructure:** Docker, Docker Compose  
- **Deployment:** AWS EC2, Nginx (reverse proxy + SSL), Route 53 (DNS)  

---

## Running the Project Locally

### Prerequisites
- Docker  
- Docker Compose  

### Start the project
```bash
docker compose -f docker-compose.dev.yml up --build
```

Once running, open your browser at:
```bash
http://localhost:5173
```
### Development Environment Note

When running in the development environment, you may see duplicated users in the online users indicator.  
This happens because React's `<React.StrictMode>` is enabled, which causes certain components and effects to render twice in dev mode.  

In production, this behavior does not occur.  
You can remove `<React.StrictMode>` in development to see the expected behavior.

### Deployment

The project is deployed on AWS EC2, using Nginx as a reverse proxy with SSL enabled and Route 53 for DNS resolution.

Live URL:
👉 https://summai-challenge.ghassen-jebbari.de/

### Notes

- No authentication is implemented (as per the challenge instructions)
- The BPMN diagram is stored in memory
- The implementation favors a clear event flow over advanced collaboration algorithms

### Author

Built by Ghassen Jebbari as part of the SUMM AI 2025 Summer Challenge.
