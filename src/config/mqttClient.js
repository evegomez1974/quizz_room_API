const mqtt = require('mqtt');
const pool = require('./db');

let io = null; 

let lastMessage = null;
let buzzerList = [];

let premierBuzzerId;
let hasBuzzedList = [];

const topics = ['init/buzzers', 'play/game', 'play/canBuzz', 'play/buzz']

const topicHandlers = {
  'init/buzzers': handleTopicInitBuzzers, 
  'play/game': handleTopicPlayGame,
  'play/canBuzz': handleTopicPlayCanBuzz,
  'play/buzz': handleTopicPlayBuzz
}


// TEMPORAIRE, tant que l'on ne récupère pas le nom des joueurs (pioche aléatoirement dedans)
const TEMP_userName = ['Alice', 'Bob', 'Charlie', 'Diane', 'Lucie', 'François', 'Stephanie', 'Hugo', 'Emilie', 'Jacques'];
const TEMP_usedName = [];


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

  // Subscribes aux topics
  client.on('connect', () => {
    console.log('Connecté au broker MQTT');

    for (topic of topics) {
      client.subscribe(topic, err => { if (err) console.error(`Erreur subscription MQTT, topic ${topic}`, err); });
    }
  });

  // Lors d'un message dans un topic
  client.on('message', async (topic, message) => {

    // Transforme le message de retour en JSON
    let msgJson
    try{
      msgJson = JSON.parse(message.toString());
    } catch(err) {
      console.log('Erreur pour transformer le message reçu en json :\n', err)
      return;
    }

    lastMessage = message;
    console.log("MQTT topic: " + topic + " ==> RETOUR:\n" + message.toString());

    // Récupère la fonction lié au topic 
    const handler = topicHandlers[topic];

    // Lance la fonction lié au topic
    if (handler) {
      try{
        handler(client, topic, msgJson);
      } catch(err) {
        console.error(`Erreur pour utilisé la fonction handler du topic ${topic}:\n`, err);
      }
    }

    // Exemple : stocker dans PostgreSQL (table buzzer_events)
    // try {
    //   await pool.query('INSERT INTO buzzer_events (message, received_at) VALUES ($1, NOW())', [message]);
    // } catch (err) {
    //   console.error('Erreur insertion dans la table buzzer_events !\n', err);
    // }

    // Diffuser via socket.io à tous les clients connectés
    if (io) {
      io.emit('buzzerUpdate', { state: message });
    }
  });
}


// Ajoute un buzzer à la liste des buzzers utilisé (avec un user lié)
function handleTopicInitBuzzers(client, topic, msgJson){

  // TEMPORAIRE, pour la récup aléatoire de l'userName
  const availableNames = TEMP_userName.filter(name => !TEMP_usedName.includes(name));
  const randomIndex = Math.floor(Math.random() * availableNames.length);
  const userName = availableNames[randomIndex];

  //
  // AJOUTER ici la requete qui créer un user. Il faudrait donc aussi pourvoir récup le nom de l'user
  //

  buzzerList.push({"buzzerId": msgJson.id, "userName": userName});
  console.log('buzzerId : '+msgJson.id)
  console.log('userName : '+userName)
}


// Vide la liste des buzzers de la partie
function handleTopicPlayGame(client, topic, msgJson){
  if (msgJson.message == 'game start'){
    buzzerList = []
    premierBuzzerId = '';
    hasBuzzedList = [];
    console.log(' --> Vide la liste des buzzers de la partie : '+premierBuzzerId)
  }
}


// Vide la liste des buzzs de la question
function handleTopicPlayCanBuzz(client, topic, msgJson){
  if (msgJson.message == 'buzz start'){
    premierBuzzerId = '';
    hasBuzzedList = [];
    console.log(' --> Vide la liste des buzzs de la question : '+premierBuzzerId)
  }
} 


// Ajout à la liste des buzzers
function handleTopicPlayBuzz(client, topic, msgJson){

  // Incrémente la liste des buzzers qui ont appuyé
  hasBuzzedList.push({"buzzerId": msgJson.buzzer, "reactivity": msgJson.reactivity});

  // Trouve le buzzer (parmis la liste) avec la plus petite réactivité
  const premierBuzzer = hasBuzzedList.reduce((min, buzzer) => buzzer.reactivity < min.reactivity ? buzzer : min , hasBuzzedList[0]);
  premierBuzzerId = premierBuzzer.buzzerId;
  console.log('buzzerId : '+msgJson.buzzer)
  console.log('reactivity : '+msgJson.reactivity)
  console.log(' --> Premier buzzer : '+premierBuzzerId)
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


module.exports = { initMqtt, getLastMessage };
