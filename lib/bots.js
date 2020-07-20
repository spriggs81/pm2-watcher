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
         cb(false,data);
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
