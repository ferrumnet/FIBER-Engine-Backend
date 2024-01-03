"use strict";

var mongoose = require("mongoose");
var collectionName = "configurations";

var schema = mongoose.Schema(
  {
    slippage: { type: Number, default: 0 },
    nativeTokens: [
      {
        address: { type: String, default: "" },
        wrappedAddress: { type: String, default: "" },
        oneInchAddress: { type: String, default: "" },
      },
    ],
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
  },
  { collection: collectionName }
);

var gasFeesModel = mongoose.model(collectionName, schema);
module.exports = gasFeesModel;
