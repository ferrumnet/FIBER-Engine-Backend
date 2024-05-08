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
  to: string
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
      to
    );
  } else {
    console.log("OneInch provider");
    return await oneInchProvider(chainId, src, dst, amount, slippage, from, to);
  }
};

export const oneInchProvider = async (
  chainId: string,
  src: string,
  dst: string,
  amount: any,
  slippage: string,
  from: string,
  to: string
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
  if (response?.responseMessage) {
    throw response?.responseMessage;
  }
  if (response && response.amounts && response.data) {
    amounts = response.amounts;
    callData = response.data;
  }
  return {
    amounts: amounts,
    callData: callData,
  };
};

export const kyberSwapProvider = async (
  chainId: string,
  src: string,
  dst: string,
  amount: any,
  slippage: string,
  from: string,
  to: string
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
  if (response?.responseMessage) {
    throw response?.responseMessage;
  }
  if (response && response.amounts && response.data) {
    amounts = response.amounts;
    callData = response.data;
  }
  return {
    amounts: amounts,
    callData: callData,
  };
};

const delay = (ms: any) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
