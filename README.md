# PM2 Watch & Monitor

The application watches PM2 Processes; if a process stops, errored, fails, or none thing starts, it will send out an email notification.  Once an offline process comes back online, the application will send out a follow-up email notification.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Installing

A step by step series of examples that tell you how to get a development env running

Install the app from NPM:

```
npm install pm2-watcher --save
```

Once installed, you will need to install the dependencies:

```
C:\pm2-watcher> npm install
```

Once dependencies are installed, start the app:

```
C:\pm2-watcher> node index.js
```

Jump to the splash page and enter in the required information.


## Authors

* **John Spriggs** - *Initial work* - [spriggs81](https://github.com/spriggs81)

## Acknowledgments
*  Spenser C.
