module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`Client connecté : ${socket.id}`);

    // Exemple : écouter un message du client
    socket.on('messageToServer', (data) => {
      console.log('📨 Message reçu :', data);

      // Répondre au client
      socket.emit('messageFromServer', {
        text: `Hello ${data.name}, reçu !`,
        timestamp: new Date(),
      });
    });

    socket.on('disconnect', () => {
      console.log(`Client déconnecté : ${socket.id}`);
    });
  });

}
