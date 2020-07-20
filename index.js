// Dependenties
const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const _bot = require('.\\lib\\bots');
const main = require('.\\lib\\main');

// Setting up server app
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
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
   _bot.checkAppSettings('app',(err,data) => {
      if(!err && data){
         app = data;
      } else {
         app = false;
      }
      res.render('home',{appSetting:app});
   });
});

app.get('/app/create',(req, res) => {
   let app;
   _bot.checkAppSettings('app',(err,data) => {
      if(!err && data){
         app = data;
      } else {
         app = false;
      }
      res.render('create',{appSetting:app});
   });
});

app.post('/app/create',(req,res) => {
   const appSettings = req.body.app;
   const hostName = typeof(appSettings.hostName) == 'string' && appSettings.hostName.trim().length > 0 ? appSettings.hostName.trim() : false;
   const port = typeof(appSettings.port) == 'string' && appSettings.port.trim().length > 0 ? appSettings.port.trim() : false;
   const secure = typeof(appSettings.secure) == 'string' && appSettings.secure.trim().length > 0 ? appSettings.secure.trim() : false;
   const from = typeof(appSettings.form) == 'string' && appSettings.from.trim().length > 0 ? appSettings.form.trim() : false;
   const sender = typeof(appSettings.sender) == 'string' && appSettings.sender.trim().length > 0 ? appSettings.sender.trim() : false;
   const user = typeof(appSettings.user) == 'string' && appSettings.user.trim().length > 0 ? appSettings.user.trim() : false;
   const password = typeof(appSettings.password) == 'string' && appSettings.password.trim().length > 0 ? appSettings.password.trim() : false;
   const debugging = typeof(appSettings.debugging) == 'string' && appSettings.debugging.trim().length > 0 ? appSettings.debugging.trim() : false;
   const seconds = typeof(appSettings.seconds) == 'number' && appSettings.seconds > 0 ? appSettings.seconds : false;
   if(hostName && port && secure && from && sender && user && password && debugging && seconds){
      
   } else {
      res.redirect('/app/create');
   }
   _bot.writeSettings('app','settings',appSettings,(err) => {
      if(!err){
         res.redirect('/');
      } else {
         res.redirect('/app/create');
      }
   });
});

app.get('/app/edit',(req,res) => {
   let app;
   _bot.checkAppSettings('app',(err,data) => {
      if(!err && data){
         app = data;
      } else {
         app = false;
      }
      res.render('edit',{appSetting:app});
   });

});

app.put('/app/edit',(req,res) => {
   const appSettings = req.body.app;
   _bot.writeSettings('app','settings',appSettings,(err) => {
      if(!err){
         res.redirect('/');
      } else {
         res.redirect('/app/edit');
      }
   });
});

/*
* server
*
*/

const port = 3000;
app.listen(port,'localhost',() => {
     console.log("listening on http://localhost:"+port);
});

main.init();
