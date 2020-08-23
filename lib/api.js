// dependencies
const server = require('.\\server');
const main = require('.\\main');
const _bot = require('.\\bots');

// Container for app object
const app = {};

app.startServer = (port) => {
   server.init(port);
   main.init((err,status) => {
      if(err){
         console.log('\x1b[31m',status,'\x1b[0m');
      } else {
         console.log('\x1b[32m',status,'\x1b[0m');
      }
   });
};

app.setMail = (obj) => {
   const hostName = typeof(obj.hostName) == 'string' && obj.hostName.trim().length > 0 ? obj.hostName.trim() : false;
   const port = typeof(obj.port) == 'number' && obj.port > 0 ? Number(obj.port) : false;
   const secure = obj.secure === true ? true : false;
   const from = typeof(obj.from) == 'string' && obj.from.trim().length > 0 ? obj.from.trim() : false
   const sender = typeof(obj.sender) == 'string' && obj.sender.trim().length > 0 ? obj.sender.trim() : false;
   const user = typeof(obj.user) == 'string' && obj.user.trim().length > 0 ? obj.user.trim() : false;
   const password = typeof(obj.password) == 'string' && obj.password.trim().length > 0 ? obj.password.trim() : false;
   console.log(hostName , port , [true,false].indexOf(secure) > -1 , from , sender , user , password);
   if(hostName && port && [true,false].indexOf(secure) > -1 && from && sender && user && password){
      data = {
         hostName : hostName,
         port : port,
         secure : secure,
         from : from,
         sender : sender,
         user : user,
         password : password
      }
      _bot.writeSettings('settings','mail',data,(err) => {
         if(err){
            console.log(err);
         }
      });
   } else {
      console.log("Problem with setMail settings!");
   }
};

app.setApp = (obj) => {
   const booleanArry = [true,false];
   const debugging = obj.debugging === true ? true : false;
   const failedDelays = typeof(obj.port) == 'string' && obj.failedDelays > 0 ? Number(obj.failedDelays) : 300;
   const passedDelays = typeof(obj.passedDelays) == 'string' && obj.passedDelays > 0 ? Number(obj.passedDelays) : false;
   const allowLogs = obj.allowLogs === false ? false : true;
   if(booleanArry.indexOf(debugging) > -1 && failedDelays && passedDelays && booleanArry.indexOf(allowLogs) > -1){
      data = {
         debugging : debugging,
         failedDelays : failedDelays,
         passedDelays : passedDelays,
         allowLogs : allowLogs
      }
      _bot.writeSettings('settings','app',data,(err) => {
         if(err){
            console.log(err);
         }
      });
   } else {
      console.log("Problem with setApp settings!");
   }
};

app.startApp = () => {
   _bot.checkAppSettings('mail',(err,mailData) => {
      if(!err && mailData){
         _bot.checkAppSettings('app',(err,appData) => {
            if(!err && appData){
               main.init((err,status) => {
                  if(err){
                     console.log('\x1b[31m',status,'\x1b[0m');
                     return;
                  }
                  console.log('\x1b[32m',status,'\x1b[0m');
               });
            } else {
               console.log("No app settings provided, will use system default!");
               _bot.setDefaultSettings();
               main.init((err,status) => {
                  if(err){
                     console.log('\x1b[31m',status,'\x1b[0m');
                     return;
                  }
                  console.log('\x1b[32m',status,'\x1b[0m');
               });
            }
         });
      } else {
         console.log("Please check your mail settings! ",err);
      }
   });
}


module.exports = app;
