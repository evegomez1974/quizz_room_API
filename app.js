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
const { initMqtt, getLastMessage, publishMessage, getHasBuzzedList, resetHasBuzzedList, getBuzzerList, getPremierBuzzerUserName } = require('./src/config/mqttClient');


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Empeche l'API de crash en cas de problèmes de connection
process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
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

// websoket

let buzzerList = []; 

// Pour SSE :
let questionLabel = '';
let questionTimer = '';
let questionEndTimer = false;
let reponseWinnerIndex = false;


// 📁 dans le fichier principal de ton serveur, après avoir défini `io`
io.on('connection', (socket) => {
  console.log('Nouveau client connecté:', socket.id);

  socket.on('buzz', (data) => {
    console.log('Buzz reçu:', data);

    buzzerList.push({
      buzzerId: data.buzzerId,
      userId: data.userId,
      userName: data.userName
    });
    // Renvoie la vraie liste des buzzers créés dynamiquement
    io.emit('buzzerUpdate', buzzerList);
    console.log('Envoi buzzerList :', buzzerList);
    // affichage via sse 
  });

  socket.on('game start', (data) => {
    console.log('Réception game start:', data);
    // on affiche sur l'écan des jouer via sse
    // message MQTT 
      const topic = 'play/game';
      const message = JSON.stringify({ message: 'game start' });
      publishMessage(topic, message); 
    
  });

  socket.on('question start', (data) => {
    console.log('Réception question start:', data);
    
    // Pour SSE :
    questionLabel = data.question;
    questionTimer = data.timer;
    questionEndTimer = false;

    // deconte timer affichage questiohn + timer 
  });

  // Réponse juste
  socket.on('result question', (data) => {
    console.log('Réception result question (juste):', data);
    reponse = data;
  });

  // Réponse fausse
  socket.on('question result', (data) => {
    console.log('Réception question result (fausse):', data);
    reponse = data;
  });

  socket.on('timer ended', ({ gameId, questionId }) => {
    console.log(`Timer terminé pour la partie ${gameId}, question ${questionId}`);

    // afficher GO


    // Publier un message MQTT ici
      const topic = 'play/canBuzz';
      const message = JSON.stringify({ message: 'buzz start' });

    // Pour SSE :
    questionEndTimer = true;

      publishMessage(topic, message); 

      // // Réinitialiser la liste avant chaque session de buzz
      // hasBuzzedList = [];
      resetHasBuzzedList();

      // Attendre 5 secondes puis traiter le premier buzzer
      setTimeout(() => {
        const hasBuzzedList = getHasBuzzedList();
        if (!hasBuzzedList || hasBuzzedList.length === 0) {
          console.log('Aucun buzzer n\'a répondu à temps.');
          socket.emit('noBuzz', { gameId, questionId });
          return;
        }

        const premierBuzzer = hasBuzzedList.reduce((min, buzzer) => 
          buzzer.reactivity < min.reactivity ? buzzer : min, 
          hasBuzzedList[0]
        );

        const premierBuzzerId = premierBuzzer.buzzerId;

        console.log(`Premier buzzer : ${premierBuzzerId}`);
        console.log(`Liste buzzer : ${JSON.stringify(hasBuzzedList, null, 2)}`);


        // Envoi au front 
        socket.emit('buzz result', {
          // gameId,
          // questionId,
          premierBuzzerId,
          buzzers: hasBuzzedList,
        });

        // quand on a le premier on envoi l'info via websoket sur ecran maitre du jeu
        // via sse sur eccran joueur
      }, 2000);

  });

  socket.on('game end', (data) => {
    console.log('Réception game end:', data);
      // fin de jeu

    // on affiche sur l'écan des jouer via sse
        // Publier un message MQTT ici
      const topic = 'play/game';
      const message = JSON.stringify({ message: 'game stop' });

      publishMessage(topic, message); 

  });

  socket.on('disconnect', () => {
    console.log('Client déconnecté:', socket.id);
  });
});



// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Serveur en écoute sur http://localhost:${PORT}`);
// });

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur en écoute sur http://localhost:${PORT}`);
});


//// ENVOIE SSE :

// ListOfPlayers :
app.get('/buzzer/api/sse/listOfPlayers', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const interval = setInterval(() => {

    data = getBuzzerList();
    // console.log(data)
    let userNameList = ''
    let index = 0;
    for (const item of data){
      if (index === 0) {
        userNameList += `${item.userName} (Buzzer: ${item.buzzerId})`
      }
      else{
        userNameList += ';' + `${item.userName} (Buzzer: ${item.buzzerId})`
      }
      index++;
     }
     
    if (userNameList != null){
      res.write(`data: ${userNameList}\n\n`);              
    }
    else{
      res.write(`data: \n\n`);
    }
  }, 1000); // Send every second

  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});


// Question :
app.get('/buzzer/api/sse/question', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const interval = setInterval(() => {

    if (!questionEndTimer){
      
      data = `${questionLabel};${questionTimer}`
      if (data != null){
        res.write(`data: ${data}\n\n`);              
      }
      else{
        res.write(`data: \n\n`);
      }

      if (questionTimer > 0){
        questionTimer = questionTimer - 1;
      }

    }
    else{
      data = `${questionLabel};`
      res.write(`data: ${data}\n\n`); 
    }
    
  }, 1000); // Send every second

  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});


// FirstPlayer
app.get('/buzzer/api/sse/firstPlayer', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const interval = setInterval(() => {
    data = getPremierBuzzerUserName()
    if (data != null){
      if (reponse.winner != null){
        res.write(`data: ${data}|||${reponse.winner}\n\n`);
      }
      else{
        res.write(`data: ${data}|||\n\n`);
      }
    }
    else{
      res.write(`data: \n\n`);
    }
  }, 100); // Send every second

  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});