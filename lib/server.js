// Dependenties
const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const _bot = require('.\\bots');
const _main = require('.\\main');

// Setting up server app
const app = express();
app.set("views",path.join(__dirname,'..\\views'))
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname,"..\\public")));
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

/*
*  Home Route
*
*/

app.get('/',(req,res) => {
   let app;
   _bot.checkAppSettings('mail',(err,data) => {
      if(!err && data){
         app = data;
      } else {
         app = false;
      }
      res.render('home',{appSetting:app});
   });
});

app.get('/app/create',(req, res) => {
   res.render('create',{appSetting:false});
});

app.post('/app/create',(req,res) => {
   const settings = {};
   settings.mail = req.body.mail;
   settings.app = req.body.app
   const hostName = typeof(settings.mail.hostName) == 'string' && settings.mail.hostName.trim().length > 0 ? settings.mail.hostName.trim() : false;
   const port = typeof(Number(settings.mail.port)) == 'number' && settings.mail.port > 0 ? Number(settings.mail.port) : false;
   const secure = typeof(settings.mail.secure) == 'string' && settings.mail.secure.trim() == "true" ? true : false;
   const from = typeof(settings.mail.from) == 'string' && settings.mail.from.trim().length > 0 ? settings.mail.from.trim() : false;
   const sender = typeof(settings.mail.sender) == 'string' && settings.mail.sender.trim().length > 0 ? settings.mail.sender.trim() : false;
   const user = typeof(settings.mail.user) == 'string' && settings.mail.user.trim().length > 0 ? settings.mail.user.trim() : false;
   const password = typeof(settings.mail.password) == 'string' && settings.mail.password.trim().length > 0 ? settings.mail.password.trim() : false;
   const debugging = typeof(settings.app.debugging) == 'string' && settings.app.debugging.trim() == "true" ? true : false;
   const failedDelays = typeof(Number(settings.app.failedDelays)) == 'number' && settings.app.failedDelays > 0 ? Number(settings.app.failedDelays) : 300;
   const passedDelays = typeof(Number(settings.app.passedDelays)) == 'number' && settings.app.passedDelays > 0 ? Number(settings.app.passedDelays) : 300;
   const allowLogs = typeof(settings.app.allowLogs) == 'string' && settings.app.allowLogs.toLowerCase() == "no" ? false : true;
   if(hostName && port && [true,false].indexOf(secure) > -1 && from && sender && user && password){
      _bot.writeSettings('settings','app',settings.app,(err) => {
         if(!err){
            if([true,false].indexOf(debugging) > -1 && failedDelays && passedDelays && [true,false].indexOf(allowLogs) > -1){
               _bot.writeSettings('settings','mail',settings.mail,(err) => {
                  if(!err){
                     _main.init();
                     res.redirect('/');
                  } else {
                     res.redirect('/app/create');
                  }
               });
            } else {
               _bot.setDefaultSettings();
               res.redirect('/');
            }

         } else {
            res.redirect('/app/create');
         }
      });
   } else {
      res.redirect('/app/create');
   }
});

app.get('/app/edit',(req,res) => {
   let settings = {};
   _bot.checkAppSettings('mail',(err,mailData) => {
      if(!err && mailData){
         settings.mail = mailData;
         _bot.checkAppSettings('app',(err,appData) => {
            if(!err && appData){
               settings.app = appData;
                  res.render('edit',{appSetting:settings});
            } else {
               settings.appSettings = false;
               res.render('edit',{appSetting:settings});
            }
         });
      } else {
         res.redirect('/app/create');
      }
   });
});

app.put('/app/edit',(req,res) => {
   _bot.checkAppSettings('mail',(err,mailData) => {
      if(!err && mailData){
         const settings = {}
         settings.mail = req.body.mail;
         settings.app = req.body.app
         const hostName = typeof(settings.mail.hostName) == 'string' && settings.mail.hostName.trim().length > 0 ? settings.mail.hostName.trim() : false;
         const port = typeof(Number(settings.mail.port)) == 'number' && settings.mail.port > 0 ? Number(settings.mail.port) : false;
         const secure = settings.mail.secure.trim() == true ? true : false;
         const from = typeof(settings.mail.from) == 'string' && settings.mail.from.trim().length > 0 ? settings.mail.from.trim() : false;
         const sender = typeof(settings.mail.sender) == 'string' && settings.mail.sender.trim().length > 0 ? settings.mail.sender.trim() : false;
         const user = typeof(settings.mail.user) == 'string' && settings.mail.user.trim().length > 0 ? settings.mail.user.trim() : false;
         const password = typeof(settings.mail.password) == 'string' && settings.mail.password.trim().length > 0 ? settings.mail.password.trim() : mailData.password;
         if(hostName && port && [true,false].indexOf(secure) > -1 && from && sender && user && password){
            _bot.writeSettings('settings','mail',settings.app,(err) => {
               if(!err){
                  const debugging = settings.app.debugging.trim() == true ? true : false;
                  const failedDelays = typeof(Number(settings.app.failedDelays)) == 'number' && Number(settings.app.failedDelays) > 0 ? Number(settings.app.failedDelays) : 300;
                  const passedDelays = typeof(Number(settings.app.passedDelays)) == 'number' && Number(settings.app.passedDelays) > 0 ? Number(settings.app.passedDelays) : 300;
                  const allowLogs = settings.app.allowLogs == false ? false : true;
                  if([true,false].indexOf(debugging) > -1 && failedDelays && passedDelays && [true,false].indexOf(allowLogs) > -1){
                     _bot.writeSettings('settings','app',settings.mail,(err) => {
                        if(!err){
                           res.redirect('/');
                        } else {
                           res.redirect('/app/create');
                        }
                     });
                  } else {
                     _bot.setDefaultSettings();
                     res.redirect('/');
                  }
               } else {
                  res.redirect('/app/create');
               }
            });
         } else {
            res.redirect('/app/edit');
         }
      } else {
         res.redirect('/app/create');
      }
   });
});

app.get('*',(req,res) => {
   res.send("This is a unknown route, please go back <a href='/'>Please click here! </a>")
});

app.init = (port) => {
   port = typeof(port) == "number" && port != null ? port : 4000;
   if(port){
      app.listen(port,'localhost',() => {
           console.log('\x1b[36m','\x1b[4m',"listening on http://localhost:"+port,'\x1b[0m');
      });
   }
}

module.exports = app;
