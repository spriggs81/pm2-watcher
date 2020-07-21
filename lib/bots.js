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

     return app.checkZero(time.MM) + '/' + app.checkZero(time.DD) + '/' + time.YY + ' ' + app.checkZero(time.HH) + ':' + app.checkZero(time.MI) + ':' + app.checkZero(time.SS)
   }

app.milVsSec = (x) => {
     if(x > 1000){
          return x/1000 + " seconds";
     }
     return x + " miliseconds";
}


app.checkAppSettings = (dir,cb) => {
   _data.open(dir,'settings',(err,data) => {
      if(!err && data){
         const hn = typeof(data.hostName) == 'string' && data.hostName.trim().length > 0 ? data.hostName.trim() : false;
         const pt = typeof(data.port) == 'string' && data.port.trim().length > 0 ? data.port.trim() : false;
         const se = typeof(data.secure) == 'string' && data.secure.trim().length > 0 ? data.secure.trim() : false;
         const fm = typeof(data.from) == 'string' && data.from.trim().length > 0 ? data.from.trim() : false;
         const sr = typeof(data.sender) == 'string' && data.sender.trim().length > 0 ? data.sender.trim() : false;
         const ur = typeof(data.user) == 'string' && data.user.trim().length > 0 ? data.user.trim() : false;
         const pd = typeof(data.password) == 'string' && data.password.trim().length > 0 ? data.password.trim() : false;
         const bg = typeof(data.debugging) == 'string' && data.debugging.trim().length > 0 ? data.debugging.trim() : false;
         const ss = typeof(Number(data.seconds)) == 'number' && Number(data.seconds) > 0 ? Number(data.seconds) : false;
         if(hn && pt && se && fm && sr && ur && pd && bg && ss){
            cb(false,data);
         } else {
            cb(true,{"Error":"Missing some required data!"});
         }
      } else {
         cb(true,err);
      }
   });
};

app.writeError = (type,area,errorData) => {
   errorData.timestamp = app.serverTime();
   const today = new Date();
   const errorName = area+'_'+app.checkZero(today.getMonth())+'-'+app.checkZero(today.getDate())+'-'+today.getFullYear();
   const fileDir = 'errors\\'+type;
   const str = JSON.stringify(errorData);
   _logs.append(fileDir,errorName,str,(err) => {
      if(!err){
         console.log(type+" error log updated!");
      } else {
         console.log("there was an error with "+type+" logs: ",err);
      }
   });
};

app.writeSettings = (dir,fileName,data, cb) => {
   _data.write(dir,fileName,data,(err) => {
      if(!err){
         console.log("file created!");
         cb(false)
      } else {
         console.log("error: ", err);
         cb(err)
      }
   });
}

app.createLogs = (dir,name,data) => {
   errorData.timestamp = app.serverTime();
   const today = new Date();
   const fixedname = name+'_'+app.checkZero(today.getMonth())+'-'+app.checkZero(today.getDate())+'-'+today.getFullYear();
   const str = JSON.stringify(data);
   _logs.append(dir,fixedname,str,(err) => {
      if(!err){
         console.log(dir+" log has been updated!");
      } else {
         app.writeError('messages','error_'+name,data);
      }
   });
};

app.findArray = (array,id,cb) => {
   const checking = (load) => load.id == id;
   const result = array.findIndex(checking);
   cb(result);
};

module.exports = app;
