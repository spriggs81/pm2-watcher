// Dependenties
const pm2 = require('pm2');
const _bot = require('.\\bots');
const _worker = require('.\\workers');
const _watcher = require('.\\watchers');
const array = require('.\\array');

// Container app info
const app = {};

// function that starts application in init function
app.main = () => {
   // connwxts to PM2 api
   pm2.connect((err) => {
      if (!err) {
         // checking for updated settings
         _bot.checkAppSettings('app', (err, settings) => {
            if (!err && settings) {
               // run if debugging in ON
               if (settings.debugging === 'true') {
                  console.log('(pm2.connect funcion) Connected to PM2 at ' + _bot.serverTime());
               }
               // Sending to the next funcion
               app.checkPm2();
            } else {
               const error = {
                  err:err,
                  internalMessage: "Unable to find settings in pm2.connect",
                  timestamp: _bot.serverTime()
               }
               _bot.createLogs('pm2Connect_chechAppSettings', 'MissingAppSettings', error);
            }
         });
      } else {
         const error = {
            err:err,
            internalMessage: "Problem connecting to the PM2 api!",
            timestamp: _bot.serverTime()
         }
         _bot.createLogs('pm2-connect', 'connectIssues', error);
         process.exit(2);
         setTimeout(() => {
            app.main();
         }, 60000);
      }
   });
};

// Creates pm2 process objects
app.checkPm2 = () => {
   if(array.checkLeng('preFailed') == true){
      _watcher.watchPrefailed();
   }
   if(array.checkLeng('passed') == true){
      _watcher.watchPassed();
   }
   // Check for the updated settings
   _bot.checkAppSettings('app', (err, settings) => {
      if (!err && settings) {
         // run if debugging is ON
         if (settings.debugging === 'true') {
            console.log("checkPM2 function started at: " + _bot.serverTime());
         }
         // Array to hold proces
         const pm2List = [];
         // creating objects from the results
         pm2.list((err, result) => {
            if (!err && result) {
               // If no processes are running, creating object
               if (result.length <= 0) {
                  const offlineProcess = {
                     pid: 'none',
                     name: 'No Processes are online!',
                     id: 'offline-911',
                     path: 'none',
                     status: 'offline',
                     uptime: 'none',
                     restartTime: 'none',
                     unstable: 'none',
                     appLog: null,
                     errLog: null,
                     checked: Date.now(),
                  }
                  pm2List.push(offlineProcess);
                  _worker.checkStatus(pm2List);
               }
               // creating new object for each process
               if (result.length > 0) {
                  result.forEach((process) => {
                     var pm2Process = {
                        pid: process.pid,
                        name: process.name,
                        id: process.pm_id,
                        path: process.pm2_env.pm_exec_path,
                        status: process.pm2_env.status,
                        uptime: process.pm2_env.pm_uptime,
                        restartTime: process.pm2_env.restart_time,
                        unstable: process.pm2_env.unstable_restarts,
                        appLog: process.pm2_env.pm_out_log_path,
                        errLog: process.pm2_env.pm_err_log_path,
                        checked: Date.now(),
                     }
                     pm2List.push(pm2Process);
                     return pm2List;
                  });
                  // run if debugging is ON
                  if (settings.debugging === 'true') {
                     console.log("(checkPm2 function) Total Number of Processes created: " + pm2List.length + " at: " + _bot.serverTime());
                  }
                  pm2.disconnect();
                  // run if debugging in ON
                  if (settings.debugging === 'true') {
                     console.log("(checkPm2 function)(pm2.disconnect) Disconnected from PM2 at: " + _bot.serverTime());
                  }
                  // Only send to next function if there's something to send
                  if (pm2List.length > 0) {
                     _worker.checkStatus(pm2List);
                  }
               }
            } else {
               const error = {
                  err: err,
                  results: result,
                  internalMessage:"(pm2.list) Having problems with reviewing the list from PM2 api",
                  timestamp:_bot.serverTime()
               }
               _bot.createLogs('checkPm2_pm2-list', 'problemsWithResult', error);
            }
         });
         // checking pm2 every 1 sec
         setTimeout(() => {
            app.checkPm2();
         }, 1000);
      } else {
         const error = {
            err: err,
            internalMessage: "Not able to find settings in checkPm2",
            timestamp: _bot.serverTime()
         }
         _bot.createLogs('checkPm2_checkAppSettings','MissingAppSettings', error);
      }
   });
}

module.exports = app;
