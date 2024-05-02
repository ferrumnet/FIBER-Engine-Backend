import crypto from "crypto";
var CryptoJS = require("crypto-js");
import * as jwt from "jsonwebtoken";
var fs = require("fs");
var { Big } = require("big.js");
const { ethers } = require("ethers");
const routerAbiMainnet = require("../../../artifacts/contracts/common/uniswap/IUniswapV2Router02.sol/IUniswapV2Router02.json");
const fundManagerAbiMainnet = require("../../../artifacts/contracts/upgradeable-Bridge/FundManager.sol/FundManager.json");
const fiberRouterAbiMainnet = require("../../../artifacts/contracts/upgradeable-Bridge/FiberRouter.sol/FiberRouter.json");
var tokenAbi = require("../../../artifacts/contracts/token/Token.sol/Token.json");

import {
  getSlippage,
  getNativeTokens,
} from "../../lib/middlewares/helpers/configurationHelper";

module.exports = {
  getHashedPassword: function (password: any) {
    return crypto.createHash("sha256").update(password).digest("base64");
  },

  createToken: function (object: any, expiresIn: any) {
    let options: any = {};
    if (expiresIn) {
      options.expiresIn = expiresIn;
    }
    return jwt.sign(object, (global as any).environment.jwtSecret, options);
  },

  decodeAPiToken: function (token: any) {
    return jwt.verify(token, (global as any as any).environment.jwtSecret);
  },

  async getValueFromStringsPhrase(queryKey: any) {
    return new Promise((resolve, reject) => {
      fs.readFile(
        "./app/lib/stringsPhrase.json",
        "utf8",
        function (err: any, data: any) {
          if (err) {
            console.log(err);
            resolve("");
          }
          if (data) {
            const phraseObj = JSON.parse(data);
            if (phraseObj) {
              for (const [key, value] of Object.entries(phraseObj)) {
                if (key == queryKey) {
                  resolve(value);
                  return;
                }
              }
            }
          }
          resolve("");
        }
      );
    });
  },

  encryptApiKey: function (data: any) {
    try {
      var ciphertext = CryptoJS.AES.encrypt(
        data,
        (global as any).environment.jwtSecret
      ).toString();
      return ciphertext;
    } catch (e) {
      console.log(e);
      return "";
    }
  },

  decryptApiKey: function (data: any) {
    try {
      var bytes = CryptoJS.AES.decrypt(
        data,
        (global as any).environment.jwtSecret
      );
      var originalText = bytes.toString(CryptoJS.enc.Utf8);
      return originalText;
    } catch (e) {
      console.log(e);
      return "";
    }
  },

  getProvider: function (rpc: any) {
    try {
      return new ethers.providers.JsonRpcProvider(rpc);
    } catch (e) {
      console.log(e);
      return null;
    }
  },

  getDexContract: function (item: any) {
    try {
      let dexContract = new ethers.Contract(
        item.router,
        routerAbiMainnet.abi,
        item.provider
      );
      return dexContract;
    } catch (e) {
      console.log(e);
      return null;
    }
  },

  getFundManagerContract: function (item: any) {
    try {
      let fundMangerContract = new ethers.Contract(
        item.fundManager,
        fundManagerAbiMainnet.abi,
        item.provider
      );
      return fundMangerContract;
    } catch (e) {
      console.log(e);
      return null;
    }
  },

  getFiberRouterContract: function (item: any) {
    try {
      let fiberRouterContract = new ethers.Contract(
        item.fiberRouter,
        fiberRouterAbiMainnet.abi,
        item.provider
      );
      return fiberRouterContract;
    } catch (e) {
      console.log(e);
      return null;
    }
  },

  convertIntoFIBERNetworks: async function (networks: any) {
    try {
      if (networks && networks.length) {
        for (let index = 0; index < networks.length; index++) {
          let network = networks[index];
          if (network) {
            let multiswapNetworkFIBERInformation: any = {
              ...network.multiswapNetworkFIBERInformation,
            };
            multiswapNetworkFIBERInformation.name = network.name;
            multiswapNetworkFIBERInformation.shortName =
              network.networkShortName;
            multiswapNetworkFIBERInformation.rpc =
              multiswapNetworkFIBERInformation.rpcUrl;
            multiswapNetworkFIBERInformation.chainId = network.chainId;
            multiswapNetworkFIBERInformation.isNonEVM = network.isNonEVM;
            if (network.isNonEVM != null && network.isNonEVM == false) {
              multiswapNetworkFIBERInformation.provider = this.getProvider(
                multiswapNetworkFIBERInformation.rpc
              );
              multiswapNetworkFIBERInformation.dexContract =
                this.getDexContract(multiswapNetworkFIBERInformation);
              multiswapNetworkFIBERInformation.fundManagerContract =
                this.getFundManagerContract(multiswapNetworkFIBERInformation);
              multiswapNetworkFIBERInformation.fiberRouterContract =
                this.getFiberRouterContract(multiswapNetworkFIBERInformation);
              multiswapNetworkFIBERInformation.aggregateRouterContractAddress =
                multiswapNetworkFIBERInformation.aggregateRouterContractAddress;
            } else {
              multiswapNetworkFIBERInformation.decimals = 18;
            }
            network.multiswapNetworkFIBERInformation =
              multiswapNetworkFIBERInformation;
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
    return networks;
  },

  getNetworkByChainId: function (chainId: any) {
    try {
      if ((global as any).networks && (global as any).networks.length) {
        return (global as any).networks.find(
          (item: any) => item.chainId === chainId
        );
      }
    } catch (e) {
      console.log(e);
    }
    return null;
  },

  amountConversion: function (amount: any) {
    try {
    } catch (e) {
      console.log(e);
    }
    return amount;
  },

  async amountToHuman(rpcUrl: any, tokenContractAddress: any, amount: number) {
    let decimal = await this.decimals(rpcUrl, tokenContractAddress);
    if (decimal) {
      let decimalFactor = 10 ** decimal;
      return new Big(amount).div(decimalFactor).toFixed();
    }

    return null;
  },

  async decimals(provider: any, tokenContractAddress: any) {
    if (provider && tokenContractAddress) {
      const contract = new ethers.Contract(
        tokenContractAddress,
        tokenAbi.abi,
        provider
      );
      return await contract.decimals();
    }

    return null;
  },

  numberIntoDecimals(amount: any, decimal: any) {
    let amountFormatted = ethers.utils.parseUnits(amount, decimal);
    amountFormatted = (global as any).utils.convertFromExponentialToDecimal(
      amountFormatted.toString()
    );
    return amountFormatted;
  },

  numberIntoDecimals_(amount: any, decimal: any) {
    let amountFormatted: any = (
      amount?.toString() *
      10 ** Number(decimal)
    ).toString();
    console.log(amountFormatted);
    amountFormatted = parseInt(amountFormatted);
    return amountFormatted;
  },

  numberIntoDecimals__(amount: any, decimal: any) {
    amount = Big(amount);
    decimal = Big(10 ** Number(decimal));
    let amountFormatted = amount.mul(decimal);
    amountFormatted = (global as any).utils.convertFromExponentialToDecimal(
      amountFormatted.toString()
    );
    amountFormatted = parseInt(amountFormatted);
    amountFormatted = (global as any).utils.convertFromExponentialToDecimal(
      amountFormatted.toString()
    );
    return amountFormatted;
  },

  decimalsIntoNumber(amount: any, decimal: any) {
    const bigNumberValue = ethers.BigNumber.from(amount.toString());
    let formattedValue = ethers.utils.formatUnits(bigNumberValue, decimal);
    formattedValue = (global as any).utils.convertFromExponentialToDecimal(
      formattedValue.toString()
    );
    return formattedValue;
  },

  async addSlippageInDecimal(originalValue: any, slippage = "") {
    let slippageProportion = Big(100 - (await getSlippage(slippage)));
    originalValue = Big(originalValue);
    let mul = originalValue.mul(slippageProportion);
    let valueWithSlippage = mul.div(Big(100));
    valueWithSlippage = (global as any).utils.convertFromExponentialToDecimal(
      valueWithSlippage.toString()
    );
    if (valueWithSlippage.includes(".")) {
      valueWithSlippage = valueWithSlippage.split(".")[0];
    }
    return valueWithSlippage ? valueWithSlippage.toString() : "0";
  },

  async addSlippageInNumber(originalValue: any) {
    let slippageProportion = 100 - (await getSlippage());
    let valueWithSlippage = (originalValue * slippageProportion) / 100;
    valueWithSlippage = (global as any).utils.convertFromExponentialToDecimal(
      valueWithSlippage.toString()
    );
    return valueWithSlippage;
  },

  encrypt: function (data: string, key: string) {
    try {
      var ciphertext = CryptoJS.AES.encrypt(data, key).toString();
      return ciphertext;
    } catch (e) {
      return "";
    }
  },

  decrypt: function (data: string, key: string) {
    try {
      var bytes = CryptoJS.AES.decrypt(data, key);
      var originalText = bytes.toString(CryptoJS.enc.Utf8);
      return originalText;
    } catch (e) {
      return "";
    }
  },

  getPrivateKey: function () {
    try {
      return this.decrypt(
        (global as any).environment.PRIVATE_KEY,
        (global as any).environment.securityKey
      );
    } catch (e) {}
    return "";
  },

  setPrivateKey: function () {
    try {
      (global as any).environment.PRI_KEY = this.getPrivateKey();
    } catch (e) {}
  },

  getWrappedNativeTokenAddress: async function (
    address: string,
    chainId: string
  ): Promise<string> {
    let tokens: any = await getNativeTokens();
    for (let item of tokens || []) {
      if (
        item?.chainId.toString() == chainId.toString() &&
        item?.address.toLowerCase() == address.toLowerCase()
      ) {
        return item?.wrappedAddress;
      }
    }
    return address;
  },

  getOneInchTokenAddress: async function (address: string): Promise<string> {
    let tokens: any = await getNativeTokens();
    for (let item of tokens || []) {
      if (item?.address.toLowerCase() == address.toLowerCase()) {
        return item?.oneInchAddress;
      }
    }
    return address;
  },

  isNativeToken: async function (address: string): Promise<boolean> {
    let tokens = await getNativeTokens();
    for (let item of tokens || []) {
      if (item?.address.toLowerCase() == address.toLowerCase()) {
        return true;
      }
    }
    return false;
  },

  getTokenByChainId: async function (chainId: string): Promise<string> {
    let tokens: any = await getNativeTokens();
    for (let item of tokens || []) {
      if (item?.chainId.toString() == chainId.toString()) {
        return item;
      }
    }
    return "";
  },
};
