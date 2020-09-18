# PM2 Watcher

The application watches PM2 Processes; if a process stops, errored, fails, or none thing starts, it will send out an email notification.  Once an offline process comes back online, the application will send out a follow-up email notification.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Installing

A step by step series of examples that tell you how to get a development env running

Install the app from NPM:

```
npm install pm2-watcher --save
```

### examples

To start the app's provided settings management please use the following code.

```
const pm2Watcher = require('pm2-watcher');

pm2Watcher.startServer(port); // optional port, app will start
                              // on port you provide it or will
                              // default to 4000
```

To start the app without using the provided settings management use the following.

```
const pm2Watcher = require('pm2-watcher');

const mailSettings = {
   hostName : "string",             // "stmp.gmail.com"
   port : "number",                 // port number
   secure : "boolean",              // true or false
   user : "string",                 // "username for email address access"
   password : "string",             // "password or token for access to Email"
   from : "string",                 // "displayed in the email's from field"
   sender : "string"                // "To" field in email ("email1@mail.com,email2@mail.com")
}

const appSettings = {
   debugging : "boolean",           // true or false (default false)
   failedDelays : "number",         // delay(secs) between email notify for failed process (default 300)
   passedDelays : "number",         // delay(secs) between email notify of online process that failed (default 300)
   allowLogs : "boolean"            // true or false (default true)
}

pm2Watcher.setMail(mailSettings)    // Enters in mail settings for app to use

pm2Watcher.setApp(appSettings)      // Enters in app settings

pm2Watcher.startApp()               // Start the app using the provided settings
```

You can also watch an install, setup, and demo/testing of the app here:

```
[YouTube](https://youtu.be/8m2RnxCvOL0);
```

## Authors

* **John Spriggs** - *Initial work* - [spriggs81](https://github.com/spriggs81)

## Acknowledgments
*  Spenser
