// Dependenties
const _bot = require('.\\bots');
const mailer = require('.\\mailer');
const array = require('.\\array');

// Container app info
const app = {};

// watches processes that have failed
app.watchPrefailed = () => {
   // checks for updated settings
   _bot.checkAppSettings('app', (err, settings) => {
      if (!err && settings) {
         //  converting seconds into milliseconds
         const maxTime = Number(settings.failedDelays) * 1000;
         // Array to hold problem processes that need to be emailed
         const problems = [];
         // run only if debugging is ON
         if (settings && settings.debugging === 'true') {
            console.log("(watchPrefailed function) Looking for processed that have failed for " +settings.failedDelays + " seconds @ " + _bot.serverTime());
         }
         if (array.checkLeng('preFailed') === true) {
            const timeNow = Date.now();
            array.checkHoldingTime('preFailed',maxTime,'failed',(data) => {
               if(data){
                  data.forEach((process) => {
                     if (settings && settings.debugging === 'true') {
                        console.log("Creating message, pushing issue into Failed array, and removing issue from prefailed array @ " + _bot.serverTime());
                     }
                     if(process.id == 'offline-911'){
                        array.resetArray('failed','preFailed');
                     }
                     array.findArray('preFailed',process.id,(index) => {
                        if(index > -1){
                           array.removeFromArray('preFailed',index);
                        }
                     });
                  });
                  array.pushToArray('failed',data,'watchPrefailed','failed');
                  mailer.createMessage('failed', data);
               }
            });
         }
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
   // checking for updated settings
   _bot.checkAppSettings('app',(err,settings) => {
      if(!err && settings){
         // run only if debugging is ON
         if(settings.debugging === "true"){
            console.log("(watchPassed function) started @ "+_bot.serverTime());
         }
         if(array.checkLeng('passed') == true){
            const problemFree = [];
            const maxTime = Number(settings.passedDelays) * 1000;
            array.checkHoldingTime('passed',maxTime,'passed',(data) => {
               if(data){
                  data.forEach((process) => {
                     if(array.checkLeng('preFailed') == true){
                        array.findArray('preFailed',process.id,(index) => {
                           if(index > -1){
                              array.removeFromArray('preFailed',index);
                           }
                        });
                     }
                     if(array.checkLeng('failed') == true){
                        array.findArray('failed',process.id,(index) => {
                           if(index > -1){
                              problemFree.push(process)
                              array.removeFromArray('failed',index);
                           }
                        });
                     }
                     array.findArray('passed',process.id,(index) => {
                        if(index > -1){
                           array.removeFromArray('passed',index);
                        }
                     });
                  });
                  if(problemFree.length > 0){
                     mailer.createMessage('passed',problemFree);
                  }
               }
            });
         }
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

module.exports = app;
