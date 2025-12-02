
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for backup (if frontend storage fails)
let systemLogs = [];

// Routes
app.get('/', (req, res) => {
  res.send({ 
    system: 'TrafficNet India AI', 
    status: 'ONLINE', 
    version: '2.5.0-beta' 
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memoryUsage: process.memoryUsage()
  });
});

app.post('/api/logs', (req, res) => {
  const log = req.body;
  systemLogs.push({ ...log, serverReceived: new Date() });
  console.log(`[LOG] ${log.action}: ${log.details}`);
  res.status(201).json({ success: true });
});

// Start Server
app.listen(PORT, () => {
  console.log(`TrafficNet Backend Server running on port ${PORT}`);
});
