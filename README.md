# TrafficNet India AI

## Overview
TrafficNet is a next-generation traffic management dashboard designed for Indian smart cities. It features real-time congestion tracking, AI-powered signal optimization, and computer vision integration.

## Architecture
- **Frontend**: React, Tailwind CSS, Recharts, Lucide Icons
- **Backend**: Node.js, Express (app.js)
- **AI**: Gemini API 2.5 Flash
- **Persistence**: LocalStorage (fallback) + In-Memory Server Logs

## How to Run

### 1. Start the Backend Server
The backend handles system logging and health checks.
```bash
npm install
node app.js
```
*Server will start on port 3001*

### 2. Start the Frontend
In a separate terminal:
```bash
npm start
```
*Application will launch at http://localhost:3000*

## Features
- **Live Traffic Map**: HTML5 Canvas particle simulation.
- **AI Operations**: Gemini-powered traffic analysis and signal timing.
- **Vahan Database**: Mock vehicle registry with persistent CRUD.
- **Incident Console**: Manage accidents and VIP movements.
- **CCTV Feed**: Simulated ML detection overlay.

## Auth Credentials
- **User**: admin / india2025
- **User**: user / user
