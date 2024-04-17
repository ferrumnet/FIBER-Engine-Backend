"use strict";

var mongoose = require("mongoose");
var collectionName = "gasFees";

var schema = mongoose.Schema(
  {
    maxFeePerGas: { type: String, default: "" },
    maxPriorityFeePerGas: { type: String, default: "" },
    gasLimit: { type: String, default: "" },
    bufferForGasEstimation: { type: Number, default: 0 },
    bufferForWithdrawal: { type: Number, default: 0 },
    isAllowedDynamicGasLimit: { type: Boolean, default: false },
    chainId: { type: String, default: "" },
    dynamicValues: {
      maxFeePerGas: { type: String, default: "" },
      maxPriorityFeePerGas: { type: String, default: "" },
    },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
  },
  { collection: collectionName }
);

var gasFeesModel = mongoose.model(collectionName, schema);
module.exports = gasFeesModel;
