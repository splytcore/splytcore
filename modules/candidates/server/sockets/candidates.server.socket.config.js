'use strict';

// Create the candidates socket configuration
module.exports = function (io, socket) {
  
  console.log('init candidates socket...')

  //Can be called from anywhere
  global.emitCheckin = function (candidate) {
    console.log('emitting checking...')
    io.emit('checkinChannel', candidate)    
  }
  
  global.emitLockCandidate = function (candidate) {    
    console.log('locked')
    io.emit('lockedChannel', candidate) 
  }
  
  global.emitUnlockCandidate = function (candidate) {    
    console.log('unlocked')
    io.emit('unlockedChannel', candidate) 
  }


  // Emit the status event when a socket client is disconnected
  socket.on('disconnect', function () {
    console.log('socket disconnected')
  })
};


