// Dependenties
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// container for app
const app = {};

app.basedDir = path.join(__dirname,'..\\.logs\\');

// append file
app.append = (area,fileName,data,cb) => {
   area = typeof(area) == 'string' && area.trim().length > 0 ? area.trim() : false;
   fileName = typeof(fileName) == 'string' && fileName.trim().length > 0 ? fileName.trim() : false;
   data = typeof(data) == 'string' && data != null ? data : false;
   // verify provided information
   if(area && fileName && data){
      // try opening the file, if it doesn't exist then create it
      fs.open(app.basedDir+area+'_'+fileName+'.logs', 'a', (err, fd)=>{
         if(!err && fd){
            // appending the file
            fs.appendFile(app.basedDir+area+'_'+fileName+'.logs',data+'\n',(err) => {
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


module.exports = app;
