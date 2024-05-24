import { OneInchSwap } from "../../../httpCalls/oneInchAxiosHelper";
import { kyberSwap } from "../../../httpCalls/kyberSwapAxiosHelper";
import { isKyberSwap, getChainKyberSwap } from "../configurationHelper";
let common = (global as any).commonFunctions;

export const chooseProviderAndGetData = async (
  chainId: string,
  src: string,
  dst: string,
  amount: any,
  slippage: string,
  from: string,
  to: string,
  isForRefresh: boolean
) => {
  await delay(1000);
  if (await isKyberSwap(chainId)) {
    console.log("KyberSwap provider");
    return await kyberSwapProvider(
      chainId,
      src,
      dst,
      amount,
      slippage,
      from,
      to,
      isForRefresh
    );
  } else {
    console.log("OneInch provider");
    return await oneInchProvider(
      chainId,
      src,
      dst,
      amount,
      slippage,
      from,
      to,
      isForRefresh
    );
  }
};

export const oneInchProvider = async (
  chainId: string,
  src: string,
  dst: string,
  amount: any,
  slippage: string,
  from: string,
  to: string,
  isForRefresh: boolean
) => {
  let callData;
  let amounts;
  let response = await OneInchSwap(
    chainId,
    src,
    dst,
    amount,
    from,
    to,
    slippage
  );
  if (response?.responseMessage && !isForRefresh) {
    throw response?.responseMessage;
  }
  if (response && response.amounts && response.data) {
    amounts = response.amounts;
    callData = response.data;
  }
  return {
    amounts: amounts,
    callData: callData,
    responseMessage: response?.responseMessage,
  };
};

export const kyberSwapProvider = async (
  chainId: string,
  src: string,
  dst: string,
  amount: any,
  slippage: string,
  from: string,
  to: string,
  isForRefresh: boolean
) => {
  let callData;
  let amounts;
  let response = await kyberSwap(
    await getChainKyberSwap(chainId),
    src,
    dst,
    amount,
    slippage,
    from,
    to
  );
  console.log("response", response);
  if (response?.responseMessage && !isForRefresh) {
    throw response?.responseMessage;
  }
  if (response && response.amounts && response.data) {
    amounts = response.amounts;
    callData = response.data;
  }
  return {
    amounts: amounts,
    callData: callData,
    responseMessage: response?.responseMessage,
  };
};

const delay = (ms: any) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
