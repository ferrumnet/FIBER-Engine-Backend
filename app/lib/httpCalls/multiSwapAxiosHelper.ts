var axios = require("axios").default;
var CryptoJS = require("crypto-js");
import moment from "moment";
var crypto = require("crypto");
const localHostUrl = "http://localhost:8080/api/v1";

export const getNetworkByChainId = async (chainId: any) => {
  try {
    let baseUrl = (global as any as any).environment.baseUrlGatewayBackend;
    let url = `${baseUrl}/networks/${chainId}`;
    let res = await axios.get(url);
    return res.data.body.network;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getAllNetworks = async () => {
  try {
    let baseUrl = (global as any as any).environment.baseUrlGatewayBackend;
    if ((global as any as any).utils.IS_LOCAL_ENV) {
      baseUrl = localHostUrl;
    }
    let url = `${baseUrl}/networks/list?isNonEVM=&isAllowedOnMultiSwap=true&allowFIBERData=${
      (global as any).environment.apiKeyForGateway
    }&isPagination=false`;
    let res = await axios.get(url);
    if (
      res.data.body &&
      res.data.body.networks &&
      res.data.body.networks.length
    ) {
      (global as any).networks = await (
        global as any
      ).commonFunctions.convertIntoFIBERNetworks(res.data.body.networks);
      console.log("Refresh netwroks", (global as any).networks.length);
    }
    return res.data.body.networks;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const updateTransactionJobStatus = async (txHash: string, body: any) => {
  try {
    let config = {
      headers: {
        Authorization: getGatewayBackendToken(),
      },
    };
    let baseUrl = (global as any as any).environment.baseUrlGatewayBackend;
    if ((global as any as any).utils.IS_LOCAL_ENV) {
      baseUrl = localHostUrl;
    }
    let url = `${baseUrl}/transactions/update/from/fiber/${txHash}`;
    let res = await axios.put(url, body, config);
    return res;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getFeeDistributionDataByReferralCode = async (code: string) => {
  try {
    let config = {
      headers: {
        Authorization: getGatewayBackendToken(),
      },
    };
    let baseUrl = (global as any as any).environment.baseUrlGatewayBackend;
    if ((global as any as any).utils.IS_LOCAL_ENV) {
      baseUrl = localHostUrl;
    }
    let url = `${baseUrl}/community-member/multiSwap/referrals/fee-distribution?code=${code}`;
    let res = await axios.get(url, config);
    console.log("res?.data?.body?.feeDistribution", res?.data?.body);
    return res?.data?.body?.feeDistribution;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getGatewayBackendToken = () => {
  return "Bearer " + doEncryption();
};

const doEncryption = () => {
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
  let encryptedSessionToken = encrypt(strTokenBody, apiKey);
  return encryptedSessionToken;
};

const encrypt = (data: string, key: String) => {
  try {
    var ciphertext = CryptoJS.AES.encrypt(data, key).toString();
    return ciphertext;
  } catch (e) {
    console.log(e);
    return "";
  }
};
