import crypto from "crypto";
var CryptoJS = require("crypto-js");
import * as jwt from "jsonwebtoken";
var fs = require("fs");
var { Big } = require("big.js");
const { ethers } = require("ethers");
const routerAbiMainnet = require("../../../artifacts/contracts/common/uniswap/IUniswapV2Router02.sol/IUniswapV2Router02.json");
const fundManagerAbiMainnet = require("../../../artifacts/contracts/upgradeable-Bridge/FundManager.sol/FundManager.json");
const fiberRouterAbiMainnet = require("../../../artifacts/contracts/upgradeable-Bridge/FiberRouter.sol/FiberRouter.json");

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

  async decimals(rpcUrl: any, tokenContractAddress: any) {
    if (rpcUrl && tokenContractAddress) {
      let con = web3ConfigurationHelper.erc20(rpcUrl, tokenContractAddress);
      if (con) {
        return await con.methods.decimals().call();
      }
    }

    return null;
  },
  numberIntoDecimals(inputAmount: any, sourceTokenDecimal: any) {
    let amountFormatted = ethers.utils.parseUnits(
      inputAmount,
      sourceTokenDecimal
    );
    amountFormatted = (global as any).utils.convertFromExponentialToDecimal(
      amountFormatted.toString()
    );
    console.log("amountFormatted", amountFormatted);
    return amountFormatted;
  },
};
