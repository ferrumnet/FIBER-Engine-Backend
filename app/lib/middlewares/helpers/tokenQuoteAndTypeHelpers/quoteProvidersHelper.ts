import { OneInchSwap } from "../../../httpCalls/oneInchAxiosHelper";
let common = (global as any).commonFunctions;

export const chooseProviderAndGetData = async (
  chainId: string,
  sourceTokenAddress: string,
  destinationTokenAddress: string,
  inputAmountIntoDecimals: any,
  slippage: string,
  source: string,
  destination: string
) => {
  return oneInchProvider(
    chainId,
    sourceTokenAddress,
    destinationTokenAddress,
    inputAmountIntoDecimals,
    slippage,
    source,
    destination
  );
};

export const oneInchProvider = async (
  chainId: string,
  sourceTokenAddress: string,
  destinationTokenAddress: string,
  inputAmountIntoDecimals: any,
  slippage: string,
  source: string,
  destination: string
) => {
  let callData;
  let amounts;
  let response = await OneInchSwap(
    chainId,
    sourceTokenAddress,
    destinationTokenAddress,
    inputAmountIntoDecimals,
    source,
    destination,
    slippage
  );
  if (response?.responseMessage) {
    throw response?.responseMessage;
  }
  if (response && response.amounts && response.data) {
    (amounts = response.amounts), (callData = response.data);
  }
  return {
    amounts: amounts,
    callData: callData,
  };
};
