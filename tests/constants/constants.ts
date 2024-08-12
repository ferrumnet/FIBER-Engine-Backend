import moment from "moment";
const Crypto = require("crypto");
const CryptoJS = require("crypto-js");
export const ENV = require("../../config/dev.qa.uat.environment.json");
export const baseURL = "https://api-fiber-engine.dev.svcs.ferrumnetwork.io";

export const createAuthTokenForNodeInfra = function (
  apiKey: string,
  secretKey: string
) {
  let timelapse = 5;
  let currentTime = new Date();
  let startDateTime = moment(currentTime)
    .subtract("minutes", timelapse)
    .utc()
    .format();
  let endDateTime = moment(currentTime)
    .add("minutes", timelapse)
    .utc()
    .format();
  let randomKey = Crypto.randomBytes(512).toString("hex");
  let tokenBody: any = {};
  tokenBody.startDateTime = startDateTime;
  tokenBody.endDateTime = endDateTime;
  tokenBody.randomKey = randomKey;
  tokenBody.apiKey = apiKey;

  let strTokenBody = JSON.stringify(tokenBody);
  let encryptedSessionToken = encrypt(strTokenBody, secretKey);
  return encryptedSessionToken;
};

export const encrypt = function (data: string, key: String) {
  try {
    var ciphertext = CryptoJS.AES.encrypt(data, key).toString();
    return ciphertext;
  } catch (e) {
    console.log(e);
    return "";
  }
};
