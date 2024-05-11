var axios = require("axios").default;
import { getSlippage } from "../middlewares/helpers/configurationHelper";
import { getExpiry } from "../middlewares/helpers/gasFeeHelpers/gasFeeHelper";
import { genericProviderError } from "../middlewares/helpers/stringHelper";

interface Response {
  responseMessage: string;
  amounts: any;
  data: any;
}

export const kyberSwap = async (
  chain: string,
  tokenIn: string,
  tokenOut: string,
  amountIn: string,
  slippage: string,
  from: string,
  to: string
): Promise<Response> => {
  let amounts = null;
  let data = null;
  let responseMessage = "";
  try {
    let url = `https://aggregator-api.kyberswap.com/${chain}/api/v1/routes?tokenIn=${tokenIn}&tokenOut=${tokenOut}&amountIn=${amountIn}`;
    console.log("url", url);
    let res = await axios.get(url);
    res = res?.data?.data?.routeSummary;
    if (res) {
      let bRes = await getKyberSwapCallData(chain, res, from, to, slippage);
      if (bRes?.responseMessage) {
        responseMessage = bRes?.responseMessage;
      }
      if (bRes?.data) {
        data = bRes?.data;
      }
    }
    if (res?.amountOut) {
      amounts = res?.amountOut;
    }
  } catch (error: any) {
    console.log("kyberSwap error", error);
    responseMessage = genericProviderError;
  }

  let response: Response = {
    responseMessage: responseMessage,
    amounts: amounts,
    data: data,
  };
  return response;
};

export const getKyberSwapCallData = async (
  chain: string,
  routeSummary: any,
  from: string,
  to: string,
  slippage: any
): Promise<any> => {
  let data = null;
  let responseMessage = "";
  slippage = getSlippageInBPS(slippage);
  console.log("getSlippageInBPS", slippage);
  try {
    const body = {
      routeSummary: routeSummary,
      wallet: from,
      recipient: to,
      slippageTolerance: slippage, // in bps, 200 = 2%
      deadline: getExpiry(),
    };
    let url = `https://aggregator-api.kyberswap.com/${chain}/api/v1/route/build`;
    console.log("url", url);
    let res = await axios.post(url, body);
    res = res?.data?.data;
    console.log(res);
    if (res?.data) {
      data = res?.data;
    }
  } catch (error: any) {
    console.log("kyberSwap error", error);
    responseMessage = genericProviderError;
  }
  let response: Response = {
    responseMessage: responseMessage,
    amounts: "",
    data: data,
  };
  return response;
};

const getSlippageInBPS = (slippage: string) => {
  let response = 200;
  try {
    console.log("slippage", slippage);
    if (slippage) {
      response = Number(slippage) * 100;
    }
  } catch (e) {
    console.log(e);
  }
  return response;
};
