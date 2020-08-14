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
         console.log("(testing) - received request to email, creating message!");
         settings = settings;
         const payload = {};
         if (settings.debugging === 'true') {
            console.log("Creating Maessage at: " + _bot.serverTime());
         }
         payload.text = '';
         payload.html = '<table><thead><tr><th>ID:</th><th style="padding: 0 90px">Name:</th><th>Status:</th></tr></thead><tbody>';
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
            payload.html += "<tr><td>" + info.id + '</td><td style="padding: 0 90px">' + info.name + "</td><td>" + info.status + "</td></tr>"
         })
         payload.html += '</tbody></table>';
         // app.createLog(status,payload,settings);
         console.log("(testing) - Sending created message to be email to user!");
         app.mail(status, payload);
      } else {
         err.internalMessage = 'Missing Email Settings';
         _bot.writeError('messages', 'creatingMessages', err);
      }
   });
}



app.mail = (status, payload) => {
   _bot.checkAppSettings('app', (err, settings) => {
      let subject = '';
      if (!err && settings) {
         console.log("(testing) - Received emailing request!");
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
            info.payload = payload;
            info.timestamp = _bot.serverTime();
            const name = 'email-' + status + '-sent';
            console.log("(testing) - Email sending!");
            _bot.createLogs('messages', name, info);
            if (settings.debugging === 'true') {
               console.log("Message sent: %s", info.messageId + "  //  Date: " + _bot.serverTime());
            }
         }
         mailIt().catch((err) => {
            const error = {
               err: err,
               payload: payload,
               type_status: status,
               timestamp: _bot.serverTime()
            }
            _bot.createLogs('mail','problemWithEmail',error);
            console.log("There was a problem reaching your email account provided, please review logs");
         });
      } else {
         const error = {
            err: err,
            internalMessage: "There was a error locating the settings while trying to send an email!",
            payload: payload,
            emailStatus: "failed - no email was sent due to settings error",
            timestamp: _bot.serverTime()
         }
         _bot.writeError('mailfunction', 'MissingAppSettings', error);
      }
   });
}

module.exports = app;
