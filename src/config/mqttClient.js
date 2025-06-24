const mqtt = require('mqtt');
const pool = require('./db');

let io = null; 

let lastMessage = null; 

const topics = [
  'init/buzzers', 'play/game', 'play/canBuzz', 'play/buzz'
]

let premierBuzzer

function initMqtt(socketIo) {
  io = socketIo;

  const options = {
    username: process.env.MQTT_BROKER_USERNAME,
    password: process.env.MQTT_BROKER_PASSWORD,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
  };

  const client = mqtt.connect(process.env.MQTT_BROKER_URL, options);

  client.on("error", (err) => {
    console.log("MQTT error: ", err);
    client.end();
  });

  client.on("reconnect", () => {
    console.log("MQTT reconnecting...");
  });

  client.on('connect', () => {
    console.log('Connecté au broker MQTT');

    // Subscribes aux topics
    for (topic of topics) {
      client.subscribe(topic, err => { if (err) console.error(`Erreur subscription MQTT, topic ${topic}`, err); });
    }

    // client.subscribe('buzzer/topic', err => {
    //   if (err) console.error('Erreur subscription MQTT', err);
    // });
  });

  client.on('message', async (topic, message) => {
    const msgStr = message.toString();
    console.log("MQTT topic: " + topic + "\n ==> message: " + message.toString());

    lastMessage = msgStr;

    // if (topic == 'play/buzz' || topic == 'play/game') {

    // }

    // Exemple : stocker dans PostgreSQL (table buzzer_events)
    // try {
    //   await pool.query('INSERT INTO buzzer_events (message, received_at) VALUES ($1, NOW())', [msgStr]);
    // } catch (err) {
    //   console.error('Erreur insertion dans la table buzzer_events !\n', err);
    // }

    // Diffuser via socket.io à tous les clients connectés
    if (io) {
      io.emit('buzzerUpdate', { state: msgStr });
    }
  });
}


// Subscribe
function subscribeToTopic(client, topic) {
  console.log(`Subscribing to Topic: ${topic}`);
  client.subscribe(topic, { qos: 0 });
}


// Publish
function publishMessage(client, topic, message) {
  console.log(`Sending Topic: ${topic}, Message: ${message}`);
  client.publish(topic, message, {
    qos: 0,
    retain: false,
  });
}

function getLastMessage() {
  return lastMessage;
}

// function premierBuzz(topic, message){
//   if (topic == 'play/game'){

//   }
// }



module.exports = { initMqtt, getLastMessage };
