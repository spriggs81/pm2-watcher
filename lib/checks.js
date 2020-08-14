// Dependenties
const _bot = require('.\\bots');
const array = require('.\\array');

// Container app info
const app = {};

// checks payload for processes not in array
app.checkPayload = (arry,payload, cb) => {
    // array to hold payloads
   let newPayload = [];
   // checks for updated settings
   _bot.checkAppSettings('app', (err, settings) => {
      if (!err && settings) {
         // run only if debugging is ON
         if (settings.debugging == 'true') {
            console.log("(checkPayload) Checking " + arry + " against " + payload.length + " items in payload at: " + _bot.serverTime());
         }
         payload.forEach((load) => {
            array.findArray(arry, load.id, (index) => {
               if (index < 0) {
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
            type: arry,
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
         if (array.checkLeng('failed') === true) {
            payload.forEach((load) => {
               array.findArray('failed', load.id, (result) => {
                  if (result > -1) {
                     newPayload.push(load);
                  }
               });
            });
         }
         if (array.checkLeng('preFailed') === true) {
            payload.forEach((load) => {
               array.findArray('preFailed', load.id, (result) => {
                  if (result > -1) {
                     newPayload.push(load);
                  }
               });
            });
         }
         let newNewPayload = [];
         newPayload.forEach((newLoad) => {
            array.findArray('passed',newLoad.id,(result) => {
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

module.exports = app;
