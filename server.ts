'use strict';

var app = require('./index');
var http = require('http');
var webSockets = require('./app/lib/webSockets')();

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
(async () => {
  await (global as any).awsHelper.awsSecretsManagerInit();
  (global as any).fiberEngine = require("./scripts/fiberEngine"); // this needs to move in index.ts
  await (global as any).networksHelper.getAllNetworks();
  var mongoString = (global as any).environment.mongoConnectionUrl;
  var mongoLogger = function(coll: any, method: any, query: any, doc: any) {
    (global as any).log.debug(coll + '.' + method + '( ' + JSON.stringify(query) +  ', ' + JSON.stringify(doc) + ' )');
  };

  mongoose.set('debug', false); // mongoose.set('debug', mongoLogger)

  mongoose.connect(mongoString, function(error: any, db: any) {
    if (error) {
      (global as any).log.error(error);
    } else {
      (global as any).log.info('Connected to MongoDB');
    }
  });

  var server = http.Server(app);
  server.listen(process.env.PORT || 8080);

  server.on('listening', function () {
    (global as any).log.info('Server listening on http://localhost:%d', server.address().port);
  });
  (global as any).io = require('socket.io').listen(server);
  (global as any).io.on('connection', webSockets.newConnection);

})().catch(e => {
  console.log(e)
});
