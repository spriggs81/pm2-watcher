// Dependenties
const pm2 = require('pm2');
const _bot = require('.\\bots');
const mailer = require('.\\mailer');

//placeholders
const preFailed = [];
const failed = [];
const passed = [];

// Container app info
const app = {};

//
app.main = () => {
   pm2.connect((err) => {
      if (!err) {
         _bot.checkAppSettings('app', (err, data) => {
            if (!err && data) {
               const settings = data;
               if (settings.debugging === 'true') {
                  console.log('Connecting to PM2 at ' + _bot.serverTime());
               }
               if (settings.debugging === 'true') {
                  console.log("Starting to Check PM2 Services at " + _bot.serverTime());
               }
               app.checkPm2();
            } else {
               err.internalMessage = "Unable to find settings in pm2.connect";
               _bot.writeError('internal', 'pm2connect', err);
            }
         });
      } else {
         err.internalMessage = "problem connecting to PM2!";
         _bot.writeError('internal', 'pm2Connect', err);
         process.exit(2);
         setTimeout(() => {
            app.main();
         }, 60000);
      }
   });
};

app.checkPm2 = () => {
   console.log("failed arry: ",failed);
   console.log("preFailed arry: ",preFailed);
   console.log("passed arry: ",passed);
   _bot.checkAppSettings('app', (err, settings) => {
      if (!err && settings) {
         if (settings.debugging === 'true') {
            console.log("Starting check PM2 at: " + _bot.serverTime());
         }
         const pm2List = [];
         pm2.list((err, result) => {
            if (!err && result) {
               if (result.length <= 0) {
                  const watchedPm2 = {
                     pid: 'none',
                     name: 'No Processes are online!',
                     id: '911',
                     path: 'none',
                     status: 'offline',
                     uptime: 'none',
                     restartTime: 'none',
                     unstable: 'none',
                     appLog: null,
                     errLog: null,
                     checked: Date.now(),
                  }
                  pm2List.push(watchedPm2);
                  app.checkStatus(pm2List, settings);
               }
               if (result.length > 0) {
                  result.forEach((process) => {
                     var watchedPm2 = {
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
                     pm2List.push(watchedPm2);
                     return pm2List;
                  });
                  if (settings.debugging === 'true') {
                     console.log("Total Number of Processes Seen: " + pm2List.length + " at: " + _bot.serverTime());
                  }
                  pm2.disconnect();
                  if (settings.debugging === 'true') {
                     console.log("Disconnected from PM2 at: " + _bot.serverTime());
                     console.log("Starting Check Status at: " + _bot.serverTime());
                  }
                  if (pm2List.length > 0) {
                     app.checkStatus(pm2List);
                  }
               }
            } else {
               err.result = result;
               err.internalMessage = "Having problems checking the processes";
               _bot.writeError('internal', 'checkingPm2', err);
            }
         });
         setTimeout(() => {
            app.checkPm2();
         }, 10000);
      } else {
         const message = {
            err: err,
            internalMessage: "Not able to find settings in checkPm2",
            area: "checkPm2"
         }
         _bot.writeError('internal', 'checkPm2', message);
         app.init();
      }
   });
}

app.checkStatus = (payload) => {
   _bot.checkAppSettings('app', (err, data) => {
      if (!err && data) {
         const settings = data;
         if (settings.debugging === 'true') {
            console.log("Check Status Started at: " + _bot.serverTime());
            console.log("Payload Received " + payload);
         }
         const problemsPayload = [];
         const passedPayload = [];
         const down = false;
         payload.forEach((info) => {
            if (info.status == "stopped" || info.status == "stopping" || info.status == "errored" || info.status == "failed") {
               problemsPayload.push(info);
               return problemsPayload;
            }
            if (info.status == "online") {
               passedPayload.push(info);
               return passedPayload;
            }
         });
         if (settings.debugging === 'true') {
            console.log("Checking if processes need to be sent to checkingExisting at: " + _bot.serverTime());
         }
         if (problemsPayload.length > 0) {
            if (settings.debugging === 'true') {
               console.log("Checking Existing Failed Processes at: " + _bot.serverTime());
               console.log("Number of failed processes: " + problemsPayload.length);
            }
            app.checkingExisting("failed", problemsPayload);
         }
         if (failed.length > 0 || preFailed.length > 0) {
            if (passedPayload.length > 0) {
               if (settings.debugging === 'true') {
                  console.log("Checking if failed processes are running at: " + _bot.serverTime());
                  console.log("Number of passed processes: " + passedPayload.length);
               }
               app.checkingExisting("passed", passedPayload);
            }
         }
      } else {
         err.payload = payload;
         err.internalMessage = "Unable to check status!";
         _bot.writeError('internal', 'check-status', err);
      }
   });
}

app.checkingExisting = (status, payload) => {
   _bot.checkAppSettings('app', (err, settings) => {
      if (!err && settings) {
         if (settings.debugging === 'true') {
            console.log("Starting Checking Existing at: " + _bot.serverTime());
            console.log("Status received was " + status);
            console.log("Payload Recevied ", payload);
         }
         if (status == "failed") {
            if (failed.length > 0) {
               app.checkFailed(payload,(data) => {
                  if (data) {
                     if (preFailed.length > 0) {
                        app.checkPrefailed(data, (newData) => {
                           if (newData) {
                              app.pushToArray(preFailed, newData,"checkingExisting","failed-preFailed");
                           }
                        });
                     } else {
                        app.pushToArray(preFailed, data,"checkingExisting","failed");
                     }
                  }
               });
            } else if (preFailed.length > 0) {
               app.checkPrefailed(payload, (data) => {
                  if (data) {
                     app.pushToArray(preFailed, data,"checkingExisting","preFailed");
                  }
               });
            }
            if (failed.length <= 0 && preFailed.length <= 0){
               app.pushToArray(preFailed, payload,"checkingExisting","pre-Failed");
            }
            if(passed.length > 0){
               payload.forEach((load) => {
                  _bot.findArray(passed,load.id,(result) => {
                     if(result > -1){
                        app.removeFromArray(passed,result);
                     }
                  });
               });
            }
         } else if (status === "passed") {
            app.checkPassed(payload, (data) => {
               if (data.length > 0) {
                  app.pushToArray(passed, data,"checkingExisting","passed");
               }
            });
         } else {
            _bot.writeError('internal', 'unknownStatus', payload);
         }
         if (settings.debugging === 'true') {
            console.log("Search, Find, and Note tasks completed at: " + _bot.serverTime() + " These Processes ended");
            console.log("prefailed = " + preFailed);
            console.log("Failed = " + failed);
            console.log("Watch PreFailed started at: " + _bot.serverTime());
         }
      } else {
         err.payload = payload;
         err.internalMessage = "There was a problem locating the settings in checkingExisting!";
         _bot.writeError('internal', 'checkingExisting', err);
      }
   });
}

app.checkFailed = (payload, cb) => {
   let newPayload = [];
   _bot.checkAppSettings('app', (err, settings) => {
      if (!err && settings) {
         if (settings.debugging == 'true') {
            console.log("Checking Failed against payload at: " + _bot.serverTime());
         }
         payload.forEach((load) => {
            _bot.findArray(failed, load.id, (result) => {
               if (result < 0) {
                  newPayload.push(load);
               }
            });
         });
         if (newPayload.length < 0) {
            newPayload = false;
         }
         cb(newPayload);
      } else {
         err.payload = payload;
         err.internalMessage = "There was a problem locating the settings in checkFailed!";
         _bot.writeError('internal', 'checkFailed', err);
         cb(false);
      }
   });
};

app.checkPrefailed = (payload, cb) => {
   let newPayload = [];
   _bot.checkAppSettings('app', (err, settings) => {
      if (!err && settings) {
         if (settings.debugging == 'true') {
            console.log("Checking Pre-failed against payload at: " + _bot.serverTime());
         }
         payload.forEach((load) => {
            _bot.findArray(preFailed, load.id, (result) => {
               if (result < 0) {
                  newPayload.push(load);
               }
            });
         });
         if (newPayload.length <= 0) {
            newPayload = false;
         }
         cb(newPayload);
      } else {
         err.payload = payload;
         err.internalMessage = "There was a problem locating the settings in checkPrefailed!";
         _bot.writeError('internal', 'checkPrefailed', err);
         cb(false);
      }
   });
};

app.checkPassed = (payload, cb) => {
   let newPayload = [];
   _bot.checkAppSettings('app', (err, settings) => {
      if (!err && settings) {
         if (settings.debugging == 'true') {
            console.log("Checking Passed against payload at: " + _bot.serverTime());
         }
         if (failed.length > 0) {
            payload.forEach((load) => {
               _bot.findArray(failed, load.id, (result) => {
                  if (result > -1) {
                     newPayload.push(load);
                  }
               });
            });
         }
         if (preFailed.length > 0) {
            payload.forEach((load) => {
               _bot.findArray(preFailed, load.id, (result) => {
                  if (result > -1) {
                     newPayload.push(load);
                  }
               });
            });
         }
         let newNewPayload = [];
         newPayload.forEach((newLoad) => {
            _bot.findArray(passed,newLoad.id,(result) => {
               if(result < 0){
                  newNewPayload.push(newLoad);
               }
            });
         });
         cb(newNewPayload);
      } else {
         err.payload = payload;
         err.internalMessage = "There was a problem locating the settings in checkPassed!";
         _bot.writeError('internal', 'checkPassed', err);
         cb(false);
      }
   });
};

app.watchPrefailed = () => {
   _bot.checkAppSettings('app', (err, settings) => {
      if (!err && settings) {
         const maxTime = Number(settings.seconds) * 1000;
         const problems = [];
         // if (settings && settings.debugging === 'true') {
            console.log("Watching the preFailed array at: " + _bot.serverTime());
         // }
         if (preFailed.length > 0) {
            const timeNow = Date.now();
            if (settings.debugging === 'true') {
               console.log(preFailed.length);
            }
            for (let i = 0; i < preFailed.length; i++) {
               const aged = timeNow - preFailed[i].checked;
               console.log("Aged:",aged);
               console.log("maxTime: ",maxTime);
               if ((preFailed[i].id === "none" && preFailed[i].status === "failed") || (aged > maxTime)) {
                  if (settings && settings.debugging === 'true') {
                     console.log("prefailed Process has been down for " + _bot.milVsSec(aged));
                     console.log("Creating message, pushing issue into Failed array, and removing issue from prefailed array at: " + _bot.serverTime());
                  }
                  problems.push(preFailed[i]);
                  failed.push(preFailed[i]);
                  preFailed.splice(i, 1);
               }
            }
         }
         if (problems.length > 0) {
            mailer.createMessage('failed', problems);
         }
         setTimeout(() => {
            app.watchPrefailed();
         }, 30000);
      } else {
         err.internalMessage = "Couldn't find settings in watchPrefailed!"
         _bot.writeError('internal', 'watchPrefailed', err);
      }
   });
};

app.pushToArray = (arry,payload,area,status) => {
   _bot.checkAppSettings('app', (err, settings) => {
      if (!err && settings) {
         if(settings.debugging == 'true'){
            console.log("Starting to push to payload:\n",payload,"\n at: " + _bot.serverTime());
         }
         payload.forEach((load) => {
            arry.push(load);
            load.type = area+' '+status+' Process';
            _bot.writeError('processes', status + 'Process', load);
         });
         if(settings.debugging == 'true'){
            console.log("Finished pushing to payload:\n",arry, "\n at: " + _bot.serverTime());
         }
         return arry;
      } else {
         err.payload = payload;
         err.internalMessage = "Issue with pushing to "+area+"! no settings.";
         _bot.writeError('internal', 'pushToArray', err);
      }
   });
};

app.removeFromArray = (arry,index) => {
   _bot.checkAppSettings('app',(err,settings) => {
      if(!err && settings){
         if(settings.debugging == "true"){
            console.log("This is the start of the 'Remove From Array' function");
         }
         console.log("slicing from the array!");
         arry.splice(index,1);
         return arry;
      } else {
         err.internalMessage = "Can't find the settings from remove from array!";
         _bot.writeError('internal','removeFromArray',err);
      }
   });
};

app.watchPassed = () => {
   const problemFree = [];
   _bot.checkAppSettings('app',(err,settings) => {
      if(!err && settings){
         console.log("watchedPassed as started at: "+_bot.serverTime());
         if(passed.length > 0){
            passed.forEach((item) => {
               const pastTime = Date.now() - item.checked;
               console.log(pastTime);
               if(pastTime > 20000){
                  if(preFailed.length > 0){
                     _bot.findArray(preFailed,item.id,(index) => {
                        if(index > -1){
                           preFailed.splice(index,1);
                           _bot.findArray(passed,item.id,(passedIndex) => {
                              if(passedIndex > -1){
                                 passed.splice(passedIndex,1)
                              }
                           });
                        }
                     });
                  }
                  if(failed.length > 0){
                     _bot.findArray(failed,item.id,(index) => {
                        if(index > -1){
                           problemFree.push(item);
                           failed.splice(index,1);
                           _bot.findArray(passed,item.id,(passedIndex) => {
                              if(passedIndex > -1){
                                 passed.splice(passedIndex,1)
                              }
                           });
                        }
                     });
                  }
               }
            });
         }
         if(problemFree.length > 0){
            mailer.createMessage('passed',problemFree);
         }
         setTimeout(() => {
            app.watchPassed();
         },28000);
      } else {
         err.internalMessage = "Can't locate settings in watchPassed!";
         _bot.writeError('internal','watchPassed',err);
      }
   });
};

let i = 0;
app.init = () => {
   let data;
   _bot.checkAppSettings('app', (err, data) => {
      if (!err && data) {
         console.log('\x1b[32m',"App has Started!",'\x1b[0m');
         app.main();
         app.watchPrefailed();
         app.watchPassed();
      } else {
         i++
         if(i < 2){
            console.log('\x1b[31m',"App has not started, please check that you have added settings!",'\x1b[0m');
         }
         setTimeout(() => {
            app.init();
         }, 5000);
      }
   });
};

module.exports = app;
