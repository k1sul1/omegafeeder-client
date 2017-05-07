const fs = require('fs');
const chalk = require('chalk');

const OMEGAFEEDER_SERVER = process.env.OMEGAFEEDER_SERVER || 'ws://localhost:8000';
const OMEGAFEEDER_CLIENT_ID = process.env.OMEGAFEEDER_CLIENT_ID
  || 'OMEGAFEEDER_DEV';
const OMEGAFEEDER_CLIENT_SECRET = process.env.OMEGAFEEDER_CLIENT_SECRET
  || 'OMEGAFEEDER_DEV_SECRET';

const socket = require('socket.io-client')(OMEGAFEEDER_SERVER);
let safeToKill = true; // Change if doing something dangerous.

socket.on('connect', () => {
  console.log(chalk.yellow(`Connected to ${OMEGAFEEDER_SERVER}`));

  socket.on('authenticate', (data) => {
    console.log(data.message);
    socket.emit('authenticate', {
      CLIENT_ID: OMEGAFEEDER_CLIENT_ID,
      CLIENT_SECRET: OMEGAFEEDER_CLIENT_SECRET
    });

    socket.on('authenticated', (data) => {
      console.log(chalk.green(data.message));
    });

    socket.on('not-authenticated', (data) => {
      console.log(chalk.red(data.message));
      process.exit(1);
    });
  });
});

socket.on('message', (msg) => {
  console.log(msg);
});

socket.on('disconnect', () => {
  console.log(chalk.yellow(`Disconnected from ${OMEGAFEEDER_SERVER}`));
  // Reconnects automatically
});


const killswitch = function() {
  if (!fs.existsSync('./.running')) {
    // If the file disappears, kill.
    console.log('Trying to kill process...');
    if (safeToKill) {
      clearInterval(killswitchInterval);
      process.exit(0);
    }
  }
};

const killswitchInterval = setInterval(killswitch, 1000);
