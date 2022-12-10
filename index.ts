"use strict";
import express from 'express';
var cors = require("cors");
var kraken = require("kraken-js");
import path from 'path';
var options, app : any;

/*
 * Create and configure application. Also exports application instance for use by tests.
 * See https://github.com/krakenjs/kraken-js#options for additional configuration options.
 */
options = {
  onconfig: function (config: any, next: any) {
    /*
     * Add any additional config setup or overrides here. `config` is an initialized
     * `confit` (https://github.com/krakenjs/confit/) configuration object.
     */

    next(null, config);
  },
};

app = module.exports = express();

app.use(express.static(__dirname + "/public")); // set the static files location /public/img will be /img for users
app.use(function (req: any, res: any, next: any) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(cors());
(global as any).utils = require("./app/lib/middlewares/utils")();
(global as any).db = require("./app/models/index");
(global as any).stringHelper = require("./app/lib/middlewares/helpers/stringHelper");
(global as any).startHelper = require("./app/lib/middlewares/helpers/startHelper");
(global as any).authHelper = require("./app/lib/middlewares/helpers/authHelper");
(global as any).starterEnvironment = (global as any).startHelper.startHelperInit(process);
console.log((global as any).starterEnvironment);

if (
  (global as any).starterEnvironment.environmentTag == "dev" ||
  (global as any).starterEnvironment.environmentTag == "qa" ||
  (global as any).starterEnvironment.environmentTag == "uat"
) {
  (global as any).environment = require("./config/dev.qa.uat.environment.json");
} else if ((global as any).starterEnvironment.environmentTag == "staging") {
  (global as any).environment = require("./config/staging.environment.json");
} else if ((global as any).starterEnvironment.environmentTag == "prod") {
  (global as any).environment = require("./config/production.environment.json");
}
(global as any).log = require("./app/lib/logger");
(global as any).appRoot = path.resolve(__dirname);
(global as any)._ = require("lodash");
(global as any).asyncMiddleware = require("./app/lib/response/asyncMiddleware");
(global as any).commonFunctions = require("./app/lib/middlewares/common");

// helpers
(global as any).awsHelper = require("./app/lib/middlewares/helpers/awsHelper");
(global as any).signatureHelper = require("./app/lib/middlewares/helpers/signatureHelper");
(global as any).multiSwapHelper = require("./app/lib/middlewares/helpers/multiSwapHelper");

// crons
(global as any).removeRandomKeyJob = require("./app/lib/crons/removeRandomKeyJob");


(global as any).kraken = app.kraken;

app.use(kraken(options));
app.on("start", function () {
  (global as any).kraken = app.kraken;
  (global as any).log.info("Application ready to serve requests.");
  (global as any).log.info("Environment: %s", app.kraken.get("env:env"));
});
