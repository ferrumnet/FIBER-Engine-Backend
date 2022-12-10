"use strict";

var mongoose = require("mongoose");
var collectionName = 'randomKeys';

var schema = mongoose.Schema(
  {
    key: { type: String, default: '' },
    isActive: { type: Boolean, default: true },

    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
  },
  { collection: collectionName }
);

var randomKeysModel = mongoose.model(collectionName, schema);
module.exports = randomKeysModel;
