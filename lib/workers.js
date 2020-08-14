// Dependenties
const _bot = require('.\\bots');
const _pm2 = require('.\\pm2Api');
const mailer = require('.\\mailer');
const _check = require('.\\checks')
const array = require('.\\array');

// Container app info
const app = {};

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
            if (['stopped','stopping','errored','failed','offline'].indexOf(info.status) > -1) {
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
            app.checkingExisting('failed', problemsPayload);
         }
         // send non-problem array to next funcion
         if (array.checkLeng('failed') == true || array.checkLeng('preFailed') == true) {
            if (passedPayload.length > 0) {
               app.checkingExisting('passed', passedPayload);
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
            if (array.checkLeng('failed') == true) {
               _check.checkPayload('failed',payload,(data) => {
                  // check new payload to see any processes were reported as preFailed
                  if (data && data.length > 0 && array.checkLeng('preFailed') == true) {
                     _check.checkPayload('preFailed',data, (newData) => {
                        if (newData && newData.length > 0) {
                           array.pushToArray('preFailed', newData,"checkingExisting","failed-preFailed");
                        }
                     });
                  } else {
                     if(data && data.length > 0){
                        array.pushToArray('preFailed', data,"checkingExisting","failed");
                     }
                  }
               });
            } else if (array.checkLeng('preFailed') == true) {
               _check.checkPayload('preFailed',payload, (data) => {
                  if (data && data.length > 0) {
                     array.pushToArray('preFailed', data,"checkingExisting","preFailed");
                  }
               });
            }
            if (array.checkLeng('failed') == false && array.checkLeng('preFailed') == false && payload.length > 0){
               array.pushToArray('preFailed', payload,"checkingExisting","pre-Failed");
            }
            if(array.checkLeng('passed') == true && payload.length > 0){
               payload.forEach((load) => {
                  array.findArray('passed',load.id,(index) => {
                     if(index > -1){
                        array.removeFromArray(passed,index);
                     }
                  });
               });
            }
            // payloads with a passed status processed here:
         } else if (status === "passed") {
            _check.checkPassed(payload, (data) => {
               if (data && data.length > 0) {
                  array.pushToArray('passed', data,"checkingExisting","passed");
               }
            });
            array.findArray('failed','offline-911',(index) => {
               if(index > -1){
                  array.resetArray('failed');
                  mailer.createMessage('passed',payload);
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

module.exports = app;
