const mqtt = require('mqtt');
const pool = require('./db');
const UserService = require('../user/service');
const Partie  = require('../partie/service');


let io = null; 
let client = null;

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

// Fonction de génération d’un nom de partie
function generateGameName() {
  const adjectives = ['Épique', 'Rapide', 'Mortelle', 'Silencieuse', 'Mystérieuse'];
  const nouns = ['Foudre', 'Ombre', 'Panthère', 'Tempête', 'Phoenix'];
  const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${randomAdj} ${randomNoun}`;
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

  client = mqtt.connect(process.env.MQTT_BROKER_URL, options);
  global.mqttClient = client;

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


async function handleTopicInitBuzzers(client, topic, msgJson) {
  const buzzerArray = msgJson.buzzers;

  if (!Array.isArray(buzzerArray)) {
    console.error("Format invalide pour les buzzers :", msgJson);
    return;
  }

  const availableNames = TEMP_userName.filter(name => !TEMP_usedName.includes(name));

  if (availableNames.length < buzzerArray.length) {
    console.error("Pas assez de noms disponibles pour tous les buzzers !");
    return;
  }

  const createdUsers = [];

  for (let i = 0; i < buzzerArray.length; i++) {
    const buzzer = buzzerArray[i];
    const userName = availableNames[i];
    const roleId = 2;

    try {
      const newUser = await UserService.createUser(userName, roleId, buzzer.id);

      // Marquer le nom comme utilisé
      TEMP_usedName.push(userName);

      const userData = {
        buzzerId: buzzer.id,
        userName: newUser.name,
        userId: newUser.id
      };

      buzzerList.push(userData);
      createdUsers.push(userData);

      console.log('Utilisateur créé :', userData);
    } catch (err) {
      console.error(`Erreur lors de la création du user pour le buzzer ${buzzer.id} :`, err);
    }
  }
  //console.log('Liste emit :', createdUsers);
  // Réemission à tous les clients quand tous les users sont créés
  if (io) {
    io.emit('buzzerUpdate', { buzzers: createdUsers });
  }
}



async function handleTopicPlayGame(client, topic, msgJson) {
  if (msgJson.message === 'game start') {
    buzzerList = []
    premierBuzzerId = '';
    hasBuzzedList = [];
    console.log(' --> Vide la liste des buzzers de la partie : '+premierBuzzerId)
    try {
      console.log("on envoie via sse sur ecran joueur")
      // afficher la question et la partie à l'écran des user plus le timer (décompte) via sse
    } catch (error) {
      console.error('Erreur lors du démarrage du jeu :', error);
    }
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
   
  // quand on a le premier on envoi l'info via websoket sur ecran maitre du jeu
  // on ajoute l'ihfo dans la table question_user de la bdd
}


// Subscribe
function subscribeToTopic(client, topic) {
  console.log(`Subscribing to Topic: ${topic}`);
  client.subscribe(topic, { qos: 0 });
}


// Publish

function publishMessage(topic, message) {
  if (!client) {
    console.error('MQTT client not initialized.');
    return;
  }

  if (!client.connected) {
    console.error('MQTT client not connected.');
    return;
  }

  client.publish(topic, message, { qos: 1 }, (err) => {
    if (err) console.error('Publish error:', err);
    else console.log(`Message published to ${topic}:`, message);
  });
}




function getLastMessage() {
  return lastMessage;
}

function getMqttClient() {
  return client;
}


module.exports = { initMqtt, getLastMessage, publishMessage, getMqttClient  };
