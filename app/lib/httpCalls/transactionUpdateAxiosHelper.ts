var axios = require("axios").default;
var Web3 = require("web3");
var { Big } = require("big.js");
var CryptoJS = require("crypto-js");
import moment from "moment";
var crypto = require("crypto");

module.exports = {
  async updateTransactionJobStatus(txHash: string, body: any) {
    try {
      let config = {
        headers: {
          Authorization: this.getGatewayBackendToken(),
        },
      };
      let baseUrl = (global as any as any).environment.baseUrlGatewayBackend;
      if ((global as any as any).utils.IS_LOCAL_ENV) {
        baseUrl = "http://localhost:8080/api/v1";
      }
      let url = `${baseUrl}/transactions/update/from/fiber/${txHash}`;
      let res = await axios.put(url, body, config);
      console.log("updateTransactionJobStatus response", res.data);
      return res;
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  getGatewayBackendToken() {
    return "Bearer " + this.doEncryption();
  },

  doEncryption() {
    let timelapse = 1;
    let currentTime = new Date();
    let startDateTime = moment(currentTime)
      .subtract("minutes", timelapse)
      .utc()
      .format();
    let endDateTime = moment(currentTime)
      .add("minutes", timelapse)
      .utc()
      .format();
    let randomKey = crypto.randomBytes(512).toString("hex");
    let tokenBody: any = {};
    tokenBody.startDateTime = startDateTime;
    tokenBody.endDateTime = endDateTime;
    tokenBody.randomKey = randomKey;

    let strTokenBody = JSON.stringify(tokenBody);
    let apiKey = (global as any).environment.API_KEY_FOR_MULTISWAP as string;
    let encryptedSessionToken = this.encrypt(strTokenBody, apiKey);
    return encryptedSessionToken;
  },

  encrypt(data: string, key: String) {
    try {
      var ciphertext = CryptoJS.AES.encrypt(data, key).toString();
      return ciphertext;
    } catch (e) {
      console.log(e);
      return "";
    }
  },
};
