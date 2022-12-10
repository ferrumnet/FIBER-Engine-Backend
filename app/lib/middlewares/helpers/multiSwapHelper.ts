var HDWalletProvider = require("@truffle/hdwallet-provider");
var Web3= require("web3");
import crypto from 'crypto';
var CryptoJS = require("crypto-js");

module.exports = { 

  getTokenCategorizedInformation: async function (req: any) {
    let data: any = {};

    let sourceTokenCategorizedInfo: any = {};
    sourceTokenCategorizedInfo.isFoundary = true;
    sourceTokenCategorizedInfo.isRefinary = true;
    sourceTokenCategorizedInfo.isIonic = true;
    sourceTokenCategorizedInfo.sourceAmount = req.query.sourceAmount;

    let destinationTokenCategorizedInfo: any = {};
    destinationTokenCategorizedInfo.isFoundary = true;
    destinationTokenCategorizedInfo.isRefinary = true;
    destinationTokenCategorizedInfo.isIonic = true;
    destinationTokenCategorizedInfo.sourceAmount = 20;

    data.sourceTokenCategorizedInfo = sourceTokenCategorizedInfo;
    data.destinationTokenCategorizedInfo = destinationTokenCategorizedInfo;

    return data;
  },

  getApprovalSigned: async function (req: any) {
    let data: any = {};
    return data;
  },

  getSwapSigned: async function (req: any) {
    let data: any = {};
    return data;
  },

  getWithdrawSigned: async function (req: any) {
    let data: any = {};
    // throw 'data error';
    return data;
  },

}
