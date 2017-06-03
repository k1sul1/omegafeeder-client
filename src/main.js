const fs = require('fs');
const chalk = require('chalk');
const fetch = require('isomorphic-fetch');

const SERVER = process.env.SERVER || 'ws://localhost:7890';
const SECRET = process.env.SECRET || 'OMEGAFEEDER_SECRET';
const USERNAME = process.env.USERNAME || 'USERNAME';
const PASSWORD = process.env.PASSWORD || 'PASSWORD';

const getToken = (user, pass) => {
  return fetch(SERVER.replace('ws://', 'http://') + `/authenticate?username=${user}&password=${pass}`);
};

const client = (token) => {
  const socket = require('socket.io-client')(SERVER);
  let safeToKill = true; // Change if doing something dangerous.

  socket.on('connect', () => {
    console.log(chalk.yellow(`Connected to ${SERVER}`));

    socket
      .emit('authenticate', { token: token })
      .on('authenticated', () => {
        //do other things
        console.log('authed');
      })
      .on('unauthorized', (error, callback) => {
        if (error.data.type === "UnauthorizedError" || error.data.code === "invalid_token") {
          callback();
          console.log(`Token expired or invalid.`, error.data);
        }
      });
  });

  socket.on('message', (msg) => {
    console.log(msg);
  });

  socket.on('disconnect', () => {
    console.log(chalk.yellow(`Disconnected from ${SERVER}`));
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
};

const justDoIt = () => {
  getToken(USERNAME, PASSWORD)
    .then(r => {
      if (!r.ok) {
        console.error(r);
        throw Error(r.statusText);
      }

      return r.json();
    })
    .then(r => client(r.token))
    .catch(error => {
      console.error(error);
      console.log(chalk.yellow('Retrying in 1 second'));
      setTimeout(justDoIt, 1000);
    });
};

justDoIt();
