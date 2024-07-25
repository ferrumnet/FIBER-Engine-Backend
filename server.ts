"use strict";

var app = require("./index");
var http = require("http");
var webSockets = require("./app/lib/webSockets")();
import { getAllNetworks } from "./app/lib/httpCalls/multiSwapAxiosHelper";

var mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
(async () => {
  await (global as any).awsHelper.awsSecretsManagerInit();
  (global as any).commonFunctions.setPrivateKey();
  (
    global as any
  ).fiberEngine = require("./app/lib/middlewares/helpers/swapWithdrawHelper");

  await getAllNetworks();
  var mongoString = (global as any).environment.mongoConnectionUrl;
  let isLocalEnv = (global as any).environment.isLocalEnv;
  if (isLocalEnv) {
    mongoString = (global as any).environment.localMongoConnectionUrl;
  }
  var mongoLogger = function (coll: any, method: any, query: any, doc: any) {
    (global as any).log.debug(
      coll +
        "." +
        method +
        "( " +
        JSON.stringify(query) +
        ", " +
        JSON.stringify(doc) +
        " )"
    );
  };

  mongoose.set("debug", false); // mongoose.set('debug', mongoLogger)

  mongoose.connect(mongoString, function (error: any, db: any) {
    if (error) {
      (global as any).log.error(error);
    } else {
      (global as any).removeRandomKeyJob();
      (global as any).getAllNetworkJob();
      (global as any).owlracleGasJob();
      (global as any).infuraGasJob();
      (global as any).scrollGasJob();
      (global as any).log.info("Connected to MongoDB");
    }
  });

  var server = http.Server(app);
  server.listen(process.env.PORT || 8081);

  server.on("listening", function () {
    (global as any).log.info(
      "Server listening on http://localhost:%d",
      server.address().port
    );
  });
  (global as any).io = require("socket.io").listen(server);
  (global as any).io.on("connection", webSockets.newConnection);
})().catch((e) => {
  console.log(e);
});
