"use strict";

// Dependenties
const nodemailer = require("nodemailer");
const _bot = require('.\\bots');
const _data = require('.\\data');


const app = {};

// Creates the email to be sent
app.createMessage = (status, data) => {
   _bot.checkAppSettings('app', (err, settings) => {
      if (!err && settings) {
         console.log("received request to email, creating message!");
         settings = settings;
         const payload = {};
         if (settings.debugging === 'true') {
            console.log("Creating Maessage at: " + _bot.serverTime());
         }
         payload.text = '';
         payload.html = '<table><thead><tr><th>ID:</th><th>Name:</th><th>Status:</th></tr></thead><tbody>';
         payload.attachments = [];
         data.forEach(function(info) {
            if (status == "failed") {
               if (info.appLog !== null && _bot.checkSize(info.appLog) < 25) {
                  let stdlog = {
                     filename: info.name + "_StandardLogs.txt",
                     path: info.appLog
                  }
                  payload.attachments.push(stdlog);
               }
               if (info.errLog !== null && _bot.checkSize(info.errLog) < 25) {
                  let errlog = {
                     filename: info.name + "_ErrorLogs.txt",
                     path: info.errLog
                  }
                  payload.attachments.push(errlog)
               }
            }
            payload.text += "ID: " + info.id + " / name: " + info.name + " / status: " + info.status + "\n";
            payload.html += "<tr><td>" + info.id + "</td><td>" + info.name + "</td><td>" + info.status + "</td></tr>"
         })
         payload.html += '</tbody></table>';
         // app.createLog(status,payload,settings);
         console.log("Sending created message to be email to user!");
         app.mail(status, payload);
      } else {
         err.internalMessage = 'Missing Email Settings';
         _bot.writeError('messages', 'creatingMessages', err);
      }
   });
}



app.mail = (status, payload, settings) => {
   _bot.checkAppSettings('app', (err, settings) => {
      let subject = '';
      if (!err && settings) {
         console.log("Received emailing request!");
         if (status == "failed") {
            subject = "Issue with Process(es) // Date: " + _bot.serverTime();
         } else {
            subject = "Process Now Working As Exected // Date: " + _bot.serverTime();
         }
         const mailIt = async() => {
            const secure = settings.secure === "true" ? true : false;
            // Generate test SMTP service account from ethereal.email
            // Only needed if you don't have a real mail account for testing
            // let testAccount = await nodemailer.createTestAccount();

            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
               host: settings.hostName,
               port: Number(settings.port),
               secure: secure, // true for 465, false for other ports
               auth: {
                  user: settings.user, // generated ethereal user
                  pass: settings.password // generated ethereal password
               }
            });

            // send mail with defined transport object
            let info = await transporter.sendMail({
               from: settings.from, // sender address
               to: settings.sender, // list of receivers
               subject: subject, // Subject line
               text: payload.text, // plain text body
               html: payload.html, // html body
               attachments: payload.attachments
            });
            info.type = status;
            const name = 'email-' + status + '-sent';
            console.log("Email sending!");
            _bot.createLogs('messages', name, info);
            // if (settings.debugging === 'true') {

               console.log("Message sent: %s", info.messageId + "  //  Date: " + _bot.serverTime());
            // }
         }
         mailIt().catch((err) => {
            console.error(err.message);
            process.exit(1);
         });
      } else {
         err.internalMessage = "There was a error locating the settings while trying to send an email!";
         _bot.writeError('internal', 'sendingMail', err);
         console.log("Error, no email was sent!");
      }
   });

}

app.createLog = () => {
   console.log("************* You Are Sending An Email ****************");
}

module.exports = app;
