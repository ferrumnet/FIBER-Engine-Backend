"use strict";

var mongoose = require("mongoose");
var collectionName = "configurations";

var schema = mongoose.Schema(
  {
    slippage: { type: Number, default: 0 },
    cctpBalanceThreshold: { type: Number, default: 0 },
    cctpAttestationApiThreshold: { type: Number, default: 0 },
    providerApiThreshold: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    nativeTokens: [
      {
        chainId: { type: String, default: "" },
        symbol: { type: String, default: "" },
        address: { type: String, default: "" },
        wrappedAddress: { type: String, default: "" },
        nativeAddress: { type: String, default: "" },
      },
    ],
    oneInchSelector: [
      {
        type: { type: String, default: "0" },
        hash: { type: String, default: "" },
      },
    ],
    gasNetworks: [
      {
        name: { type: String, default: "" },
        chainId: { type: String, default: "" },
        shortName: { type: String, default: "" },
        provider: { type: String, default: "owlracle" },
      },
    ],
    allowedNetworksForCCTP: [
      {
        name: { type: String, default: "" },
        chainId: { type: String, default: "" },
      },
    ],
    allowedNetworksForKyberSwap: [
      {
        name: { type: String, default: "" },
        chainId: { type: String, default: "" },
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
