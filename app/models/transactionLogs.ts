"use strict";

var mongoose = require("mongoose");
var collectionName = 'transactionLogs';

var schema = mongoose.Schema(
  {
    swapTransactionHash: { type: String, default: '' },
    sourceWalletAddress: { type: String, default: '' },
    sourceTokenContractAddress: { type: String, default: '' },
    sourceNetworkChainId: { type: String, default: '' },
    sourceAmount: { type: String, default: '' },
    destinationTokenContractAddress: { type: String, default: '' },
    destinationNetworkChainId: { type: String, default: '' },
    destinationWalletAddress: { type: String, default: '' },
    withdrawTransactionHash: { type: String, default: '' },
    isActive: { type: Boolean, default: true },

    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
  },
  { collection: collectionName }
);

var transactionLogsModel = mongoose.model(collectionName, schema);
module.exports = transactionLogsModel;
