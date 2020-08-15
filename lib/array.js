// Dependenties
const _bot = require('.\\bots');

// app object
const app = {};

// empty arrays
app.preFailed = [];
app.failed = [];
app.passed = [];

// checks length of arrays and returns boolean
app.checkLeng = (arry) => {
   const answer = app[arry].length > 0 ? true : false;
   return answer
};

// Locates index if within array
app.findArray = (array,id,cb) => {
   const checking = (load) => load.id == id;
   const result = app[array].findIndex(checking);
   cb(result);
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
            app[arry].push(load);
            load.type = area+' '+status+' Process';
            _bot.createLogs('pushToArray', status + '_Process', load);
         });
         if(settings.debugging == 'true'){
            console.log("Finished pushing to payload:\n",app[arry], "\n at: " + _bot.serverTime());
         }
         return app[arry];
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
         app[arry].splice(index,1);
         return app[arry];
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

app.resetArray = (arry) => {
   app[arry] = [];
}

app.checkHoldingTime = (array,max,status,cb) => {
   let data = [];
   app[array].forEach((process) => {
      // checking the age of the failed process
      const aged = Date.now() - process.checked;

      const timeStatus = status == "passed" ? "before confirming no problem with ID:" : " before email sent due to problem with Process ID:";
      if (process.id === "offline-911" || (aged > max)) {
         // run only if debugging is ON
         data.push(process);
      }
   });
   if(data.length <= 0){
      data = false;
   }
   cb(data);
}

module.exports = app;
