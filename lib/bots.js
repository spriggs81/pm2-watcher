const _data = require('.\\data');
const _logs = require('.\\logs');
const fs = require('fs');

const app = {};

   app.checkZero = (x) => {
        let xx = x.toString();
        if(xx.length == 1){
             xx = "0" + x;
             return xx;
        }
        return xx;
   }

   app.checkSize = (x) => {
      const stats = fs.statSync(x);
      const bytes = stats.size;
      const mb = bytes / 1000000.0;
      return mb;
   }

   app.serverTime = () => {
     const date1 = new Date();
     const time = {
          MM: date1.getMonth(),
          DD: date1.getDate(),
          YY: date1.getFullYear(),
          HH: date1.getHours(),
          MI: date1.getMinutes(),
          SS: date1.getSeconds(),
     }

     return app.checkZero(time.MM + 1) + '/' + app.checkZero(time.DD) + '/' + time.YY + ' ' + app.checkZero(time.HH) + ':' + app.checkZero(time.MI) + ':' + app.checkZero(time.SS)
   }

app.milVsSec = (x) => {
     if(x > 1000){
          return x/1000 + " seconds";
     }
     return x + " miliseconds";
}


app.checkAppSettings = (settings,cb) => {
   _data.open('settings',settings,(err,data) => {
      if(!err && data){
         cb(false,data);
      } else {
         cb(err);
      }
   });
};


app.writeSettings = (dir,fileName,data, cb) => {
   _data.write(dir,fileName,data,(err) => {
      if(!err){
         cb(false)
      } else {
         cb(err)
      }
   });
}

app.createLogs = (place,name,data) => {
   data.timestamp = app.serverTime();
   const today = new Date();
   const fixedname = name+'_'+app.checkZero(today.getMonth() + 1)+'-'+app.checkZero(today.getDate())+'-'+today.getFullYear();
   const str = JSON.stringify(data);
   _logs.append(place,fixedname,str,(err) => {
      if(err){
         app.createLogs('CreatingLogs','error_appendingFile_'+name,data);
      }
   });
};

app.setDefaultSettings = () => {
   app.checkAppSettings('mail',(err,mailData) => {
      if(!err && mailData){
         const defaultAppSettings = {
            debugging : false,
            failedDelays : 300,
            passedDelays : 300,
            allowLogs : true
         }
         app.writeSettings('settings','app',defaultAppSettings,(err) => {
            if(err){
               console.log('Error with setting default app settings: ',err);
            }
         });
      }
   });
}

module.exports = app;
