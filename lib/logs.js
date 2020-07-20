// Dependenties
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// container for app
const app = {};

app.basedDir = path.join(__dirname,'..\\.logs\\');

// append file
app.append = (dir,fileName,data,cb) => {
   dir = typeof(dir) == 'string' && dir.trim().length > 0 ? dir.trim() : false;
   fileName = typeof(fileName) == 'string' && fileName.trim().length > 0 ? fileName.trim() : false;
   data = typeof(data) == 'string' && data != null ? data : false;
   // verify provided information
   if(dir && fileName && data){
      // try opening the file, if it doesn't exist then create it
      fs.open(app.basedDir+dir+'\\'+fileName+'.logs', 'a', (err, fd)=>{
         if(!err && fd){
            // appending the file
            fs.appendFile(app.basedDir+dir+'\\'+fileName+'.logs',data+'\n',(err) => {
               if(!err){
                  // closing file
                  fs.close(fd,(err) => {
                     if(!err){
                        cb(false);
                     } else {
                        cb("There was an error closing the file");
                     }
                  });
               } else {
                  cb("There was an error appending this file");
               }
            });
         } else {
            cb("There was an erorr opening the file!");
         }
      });
   } else {
      cb("There was an error with the provided information, please check data again!");
   }
};

app.list = (dir,compressed,cb) => {
   fs.readir(app.basedDir+dir,(err,data) => {
      if(!err && data) {
         const files = [];
         data.forEach((file) => {
            if(file.indexof('.logs') > -1){
               files.push(file.replace('.logs',''));
            }
         });
         cb(false,files);
      } else {
         cb(err,data);
      }
   });
};

module.exports = app;
