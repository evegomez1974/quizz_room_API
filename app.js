require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require('http');
const { Server } = require('socket.io');
const userRoute = require('./src/user/router');
const buzzerRoute = require('./src/buzzer/router');
const roleRoute = require('./src/role/router');
const partieRoute = require('./src/partie/router');
const questionRoute = require('./src/question/router');
const themeRoute = require('./src/theme/router');
const { initMqtt, getLastMessage } = require('./src/config/mqttClient');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});


require('./src/config/socket')(io);

// **Initialiser MQTT avec socket.io**
initMqtt(io);

// Middlwares
app.use(express.json());
app.use(cors());

// Routes
app.use("/buzzer/api", userRoute);
app.use("/buzzer/api", buzzerRoute);
app.use("/buzzer/api", roleRoute);
app.use("/buzzer/api", partieRoute);
app.use("/buzzer/api", questionRoute);
app.use("/buzzer/api", themeRoute);

// Endpoint HTTP pour obtenir l'état au démarrage (exemple simple)
app.get('/buzzer/api/state', (req, res) => {
  res.json({ state: getLastMessage() || 'Aucun signal reçu' });
});

// SSE : streaming des états buzzer
app.get('/buzzer/api/stream', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  // Envoi initial
  res.write(`data: ${JSON.stringify({ state: getLastMessage() })}\n\n`);

  // Fonction à appeler quand un message arrive (via socket.io)
  const onBuzzerUpdate = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Écoute les événements socket.io 'buzzerUpdate'
  io.on('connection', (socket) => {
    socket.on('buzzerUpdate', onBuzzerUpdate);
  });

  req.on('close', () => {
    // Pour simplifier, ici pas de détachement d'écouteurs,
    // en prod tu devrais gérer ça pour éviter fuite mémoire.
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur http://localhost:${PORT}`);
});
