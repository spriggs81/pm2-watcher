const fs = require('fs');
const path = require('path');

const app = {};

app.basedDir = path.join(__dirname,'..\\.data\\');

// Job is to write data to file
app.write = (dir,fileName,data,cb) => {
   // verify that information was sent
   dir = typeof(dir) == 'string' && dir.trim().length > 0 ? dir.trim() : false;
   fileName = typeof(fileName) == 'string' && fileName.trim().length > 0 ? fileName : false;
   data = data != null ? data : false;
   if(dir,fileName,data){
      // Convert data into a string
      const stringData = JSON.stringify(data);
      // Writing the data to the file
      fs.writeFile(app.basedDir+dir+'\\'+fileName+'.json',stringData,'ax+',(err) => {
         if(!err){
            cb(false,{'Sucess':'The settings have been updated!'});
         } else {
            cb(err);
         }
      });
   } else {
      cb('There was a problem with the provided required data!');
   }
};

// Job is to read the file
app.open = (dir,fileName,cb) => {
   // verify that information was sent
   dir = typeof(dir) == 'string' && dir.trim().length > 0 ? dir.trim() : false;
   fileName = typeof(fileName) == 'string' && fileName.trim().length > 0 ? fileName : false;
   if(dir && fileName){
      // Read the data from the file
      fs.readFile(app.basedDir+dir+'\\'+fileName+'.json','utf8',(err,data) => {
         if(!err && data){
            // Covert string data into JSON
            const parsedData = JSON.parse(data);
            cb(false,parsedData);
         } else {
            cb(true,{'Error':'There was a error reading the file!'});
         }
      });
   } else {
      cb(true,{'Error':'There was a problem with the provided required data!'});
   }
};

// Job is to update the file
app.update = (dir,fileName,data,cb) => {
   // verify that information was sent
   dir = typeof(dir) == 'string' && dir.trim().length > 0 ? dir.trim() : false;
   fileName = typeof(fileName) == 'string' && fileName.trim().length > 0 ? fileName : false;
   data = typeof(data) == 'object' && data != null ? data : false;
   if(dir && fileName && data){
      // Open the file
      fs.open(app.basedDir+dir+'\\'+fileName+'.json',(err,fd) => {
         if(!err && fd){
            // Truncate the file
            fs.ftruncate(fd,(err) => {
               if(!err){
                  // Convert the data into a string
                  const stringData = JSON.stringify(data);
                  // Write to the file
                  fs.writeFile(fd,stringData,(err) => {
                     if(!err){
                        // Close the file
                        fs.close(fd,(err) => {
                           if(!err){
                              cb(false,{'Sucess':'The file has been updated!'});
                           } else {
                              cb(true,{'Error':'There was a problem closing the file!'})
                           }
                        });
                     } else {
                        cb(true,{'Error':'There was a problem writing the file!'});
                     }
                  });
               } else {
                  cb(true,{'Error':'There was a problem truncating the file!'});
               }
            });
         } else {
            cb(true,{'Error':'There was a problem opening the file'});
         }
      });
   } else {
      cb(true,{'Error':'There was a problem with the provided required data!'});
   }
};

// Job is to delete the file
app.delete = (dir,fileName,cb) => {
   // verify that information was sent
   dir = typeof(dir) == 'string' && dir.trim().length > 0 ? dir.trim() : false;
   fileName = typeof(fileName) == 'string' && fileName.trim().length > 0 ? fileName : false;
   if(dir && fileName){
      fs.unlink(app.basedDir+dir+'\\'+fileName+'.json',(err) => {
         if(!err){
            cb(false,{'Sucess':'The file has been deleted!'});
         } else {
            cb(false,{'Error':'There was a problem deleting the file!'});
         }
      });
   } else {
      cb(true,{'Error':'There was a problem with the provided required data!'});
   }
}

module.exports = app;
