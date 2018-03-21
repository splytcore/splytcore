'use strict';

// Create the candidates socket configuration
module.exports = function (io, socket) {
  
  console.log('init candidates socket...')
  // Emit the status event when a new socket client is connected  
  io.emit('checkinSocket', {
    type: 'status',
    text: 'Is now connected',
    created: Date.now()
  });

  // Send a event to all connected sockets
  socket.on('checkinSocket', function (message) {
    console.log('emitting to everybody')
    // Emit the 'candidateMessage' event
    io.emit('checkinSocket', { message: 'new checkin' });
  });

  //Can be called anywhere
  global.emitCheckin = function () {
    console.log('emitting checking...')
    io.emit('checkinSocket', { message: 'new checkin' });    
  }


  // Emit the status event when a socket client is disconnected
  socket.on('disconnect', function () {
    io.emit('checkinSocket', {
      type: 'status',
      text: 'disconnected',
      created: Date.now()    
    })
  })
};


