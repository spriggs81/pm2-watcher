// Dependenties
const _bot = require('.\\bots');
const _pm2 = require('.\\pm2Api');

// Container app info
const app = {};

// initial starting of app
app.init = () => {
   _bot.checkAppSettings('mail', (err, settings) => {
      if (!err && settings) {
         console.log('\x1b[32m',"App has Started!",'\x1b[0m');
         _pm2.main();
      } else {
         console.log('\x1b[31m',"App stopped, please check settings!",'\x1b[0m');
      }
   });
};

module.exports = app;
