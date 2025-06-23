const mqtt = require('mqtt');
const pool = require('./db');

let io = null; 

let lastMessage = null; 

function initMqtt(socketIo) {
  io = socketIo;

  const client = mqtt.connect(process.env.MQTT_BROKER_URL);

  client.on('connect', () => {
    console.log('Connecté au broker MQTT');
    client.subscribe('buzzer/topic', err => {
      if (err) console.error('Erreur subscription MQTT', err);
    });
  });

  client.on('message', async (topic, message) => {
    const msgStr = message.toString();
    console.log(`Message MQTT reçu: ${msgStr}`);

    lastMessage = msgStr;

    // Exemple : stocker dans PostgreSQL (table buzzer_events)
    try {
      await pool.query('INSERT INTO buzzer_events (message, received_at) VALUES ($1, NOW())', [msgStr]);
    } catch (err) {
      console.error('Erreur insertion en base', err);
    }

    // Diffuser via socket.io à tous les clients connectés
    if (io) {
      io.emit('buzzerUpdate', { state: msgStr });
    }
  });
}

function getLastMessage() {
  return lastMessage;
}

module.exports = { initMqtt, getLastMessage };
