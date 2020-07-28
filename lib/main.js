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
               // creating new object for each process
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
                     app.checkStatus(pm2List);
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
         app.init();d
      }
   });
}

// checking the status of each process per payload
app.checkStatus = (payload) => {
   // checking for updated settings
   _bot.checkAppSettings('app', (err, settings) => {
      if (!err && settings) {
         // run if debugging is ON
         if (settings.debugging === 'true') {
            console.log("(checkStatus function) @ ",_bot.serverTime()," -  received payload: ",'\n',payload);
         }
         // Array to hold processes with problems
         const problemsPayload = [];
         // Array to hold processes thaat have no problems
         const passedPayload = [];
         // check status of processes and push to correct array
         payload.forEach((info) => {
            if (['stopped','stopping','errored','failed'].indexOf(info.status) > -1) {
               problemsPayload.push(info);
            }
            if (info.status == "online") {
               passedPayload.push(info);
            }
            return problemsPayload, passedPayload;
         });
         if (settings.debugging === 'true') {
            console.log("Checking if processes\n(problems: "+problemsPayload.length+" / no problems: "+passedPayload.length+")\nneed to be sent to next function at: " + _bot.serverTime());
         }
         // sends problem array to next funcion
         if (problemsPayload.length > 0) {
            app.checkingExisting("failed", problemsPayload);
         }
         // send non-problem array to next funcion
         if (failed.length > 0 || preFailed.length > 0) {
            if (passedPayload.length > 0) {
               app.checkingExisting("passed", passedPayload);
            }
         }
      } else {
         const error =  {
            err: err,
            payload: payload,
            internalMessage: "Unable to locate the app settings!",
            timestamp: _bot.serverTime()
         }
         _bot.createLogs('checkStatus', 'MissingAppSettings', error);
      }
   });
}

// checks if the processes in the payload were already reported
// or if a failed process came back online
app.checkingExisting = (status, payload) => {
   // checking for updated settings
   _bot.checkAppSettings('app', (err, settings) => {
      if (!err && settings) {
         // run if debugging in ON
         if (settings.debugging === 'true') {
            console.log("(checkingExisting function) @: " + _bot.serverTime()+" -received status: "+status+ "\npayload:\n",payload);
         }
         // payload with failed status processed here:
         if (status == "failed") {
            // checking if processes from payload have be reported failed
            if (failed.length > 0) {
               app.checkPayload('failed',failed,payload,(data) => {
                  // check new payload to see any processes were reported as preFailed
                  if (data && preFailed.length > 0) {
                     app.checkPayload('preFailed',preFailed,data, (newData) => {
                        if (newData) {
                           app.pushToArray(preFailed, newData,"checkingExisting","failed-preFailed");
                        }
                     });
                  } else {
                     if(data){
                        app.pushToArray(preFailed, data,"checkingExisting","failed");
                     }
                  }
               });
            } else if (preFailed.length > 0 ) {
               app.checkPayload('preFailed',preFailed,payload, (data) => {
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
            // payloads with a passed status processed here:
         } else if (status === "passed") {
            app.checkPassed(payload, (data) => {
               if (data.length > 0) {
                  app.pushToArray(passed, data,"checkingExisting","passed");
               }
            });
            // handles payloads with unknown status
         } else {
            const error = {
               err: "Status received: "+status,
               internalMessage: "There was a record of an unknown status, please review the payload's status",
               payload: payload
            }
            _bot.createLogs('checkingExisting', 'unknownStatus-'+status, error);
         }
         // run only if debugging is ON
         if (settings.debugging === 'true') {
            console.log("(checkingExisting funcion) task completed @ " + _bot.serverTime());
         }
      } else {
         const error = {
            err: err,
            internalMessage: "Was not able to locate settings in checkingExisting function",
            payload: payload,
            timestamp: _bot.serverTime()
         }
         _bot.createLogs('checkingExisting',"MissingAppSettings",error);
      }
   });
}

// checks payload for processes not in array
app.checkPayload = (type,array,payload, cb) => {
    // array to hold payloads
   let newPayload = [];
   // checks for updated settings
   _bot.checkAppSettings('app', (err, settings) => {
      if (!err && settings) {
         // run only if debugging is ON
         if (settings.debugging == 'true') {
            console.log("(checkPayload) Checking " + type + " against " + payload.length + " items in payload at: " + _bot.serverTime());
         }
         payload.forEach((load) => {
            _bot.findArray(array, load.id, (result) => {
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
         const error = {
            err: err,
            type: type,
            payload: payload,
            internalMessage: "There was a problem locating the settings in checkPayload!",
            timestamp: _bot.serverTime()
         }
         _bot.createLogs('checkFailed', 'MissingAppSettings', error);
         cb(false);
      }
   });
};

// checks payload for processes in the arrays
app.checkPassed = (payload, cb) => {
   // Array to hold payload
   let newPayload = [];
   _bot.checkAppSettings('app', (err, settings) => {
      if (!err && settings) {
         if (settings.debugging == 'true') {
            console.log("(Checking Passed against payload at: " + _bot.serverTime());
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
         const error = {
            err: err,
            payload: payload,
            internalMessage: "There was a problem locating the settings in checkPassed!",
            timestamp: _bot.serverTime()
         }
         _bot.createLogs('checkPassed', 'MissingAppSettings', error);
         cb(false);
      }
   });
};

// watches processes that have failed
app.watchPrefailed = () => {
   // checks for updated settings
   _bot.checkAppSettings('app', (err, settings) => {
      if (!err && settings) {
         //  converting seconds into milliseconds
         const maxTime = Number(settings.seconds) * 1000;
         // Array to hold problem processes that need to be emailed
         const problems = [];
         // run only if debugging is ON
         if (settings && settings.debugging === 'true') {
            console.log("(watchPrefailed function) Looking for processed that have failed for " +settings.seconds + " seconds @ " + _bot.serverTime());
         }
         if (preFailed.length > 0) {
            const timeNow = Date.now();
            if (settings.debugging === 'true') {
               console.log(preFailed.length);
            }
            for (let i = 0; i < preFailed.length; i++) {
               // checking the age of the failed process
               const aged = timeNow - preFailed[i].checked;;
               console.log("Milliseconds Left: ",maxTime - aged," before email sent due to problem!");
               if ((preFailed[i].id === "none" && preFailed[i].status === "failed") || (aged > maxTime)) {
                  // run only if debugging is ON
                  if (settings && settings.debugging === 'true') {
                     // TODO: ================ Remove This After testing =======================
                     console.log("Creating message, pushing issue into Failed array, and removing issue from prefailed array @ " + _bot.serverTime());
                  }
                  problems.push(preFailed[i]);
                  failed.push(preFailed[i]);
                  preFailed.splice(i, 1);
               }
            }
         }
         if (problems.length > 0) {
            // TODO: ================ Remove This After testing =======================
            console.log("(Test)(watchPrefailed functin) - requested message be created to be emailed @ " + _bot.serverTime());
            mailer.createMessage('failed', problems);
         }
         // start function every 3 seconds
         setTimeout(() => {
            app.watchPrefailed();
         }, 3000);
      } else {
         const error = {
            err: err,
            internalMessage: "There was a problem locating the settings in watchPrefailed!",
            timestamp: _bot.serverTime()
         }
         _bot.createLogs('watchPrefailed','MissingAppSettings',error);
      }
   });
};

// Watching failed processes that are now online
app.watchPassed = () => {
   // Array holding problem free processes
   const problemFree = [];
   // checking for updated settings
   _bot.checkAppSettings('app',(err,settings) => {
      if(!err && settings){
         // run only if debugging is ON
         if(settings.debugging === "true"){
            console.log("(watchedPassed function) started @ "+_bot.serverTime());
         }
         if(passed.length > 0){
            passed.forEach((item) => {
               //
               const pastTime = Date.now() - item.checked;
               console.log("Milliseconds Left: ",60000 - pastTime," before confirming no problem(s)");
               if(pastTime > 60000){
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
            // TODO: Remove this after testing
            console.log("(Test)(watchPassed function) - Sending request to create email @ " + _bot.serverTime()," due to problem(s)");
            mailer.createMessage('passed',problemFree);
         }
         // starts function every 2 seonds
         setTimeout(() => {
            app.watchPassed();
         },2000);
      } else {
         const error = {
            err: err,
            internalMessage: "Can't locate settings in watchPassed!",
            timestamp: _bot.serverTime()
         }
         _bot.createLogs('watchPassed','MissingAppSettings',error);
      }
   });
};

// pushes data to the provided array
app.pushToArray = (arry,payload,area,status) => {
   // check for updated settings
   _bot.checkAppSettings('app', (err, settings) => {
      if (!err && settings) {
         // run only if debugging is ON
         if(settings.debugging == 'true'){
            console.log("Starting to push to payload:\n",payload,"\n @ " + _bot.serverTime());
         }
         payload.forEach((load) => {
            arry.push(load);
            load.type = area+' '+status+' Process';
            _bot.createLogs('pushToArray', status + '_Process', load);
         });
         if(settings.debugging == 'true'){
            console.log("Finished pushing to payload:\n",arry, "\n at: " + _bot.serverTime());
         }
         return arry;
      } else {
         const error = {
            err: err,
            payload: payload,
            internalMessage: "(pushToArray) Issue with pushing to "+area+"! no settings."
         }
         _bot.createLogs('pushToArray','MissingAppSettings',error);
      }
   });
};

// remove process from array
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
         const error = {
            err: err,
            internalMessage: "Can't find the settings from remove from array!",
            timestamp: _bot.serverTime()
         }
         _bot.createLogs('removeFromArray','MissingAppSettings',error);
      }
   });
};


let i = 0;
// initial starting of app
app.init = () => {
   let data;
   _bot.checkAppSettings('app', (err, data) => {
      if (!err && data) {
         console.log('\x1b[32m',"App has Started!",'\x1b[0m');
         app.main();
         app.watchPrefailed();
         app.watchPassed();
         i = 0;
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
