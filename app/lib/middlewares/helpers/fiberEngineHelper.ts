const { Big } = require("big.js");
import {
  SwapOneInch,
  WithdrawSigned,
  WithdrawSignedAndSwapOneInch,
  WithdrawOneInchLogs,
} from "../../../interfaces/fiberEngineInterface";
import {
  getGasForWithdraw,
  isAllowedDynamicGasValues,
  addBuffer,
} from "../../middlewares/helpers/gasFeeHelpers/gasEstimationHelper";
import { getLogsFromTransactionReceipt } from "../../middlewares/helpers/web3Helpers/web3Helper";
import { postAlertIntoChannel } from "../../httpCalls/slackAxiosHelper";
const MAX_WITH_DYNAMIC_GAS_WITHDRAW_TRIES = 9;
const MAX_WITHDRAW_TRIES = 10;

export const getWithdrawSignedObject = (
  targetTokenAddress: string,
  destinationWalletAddress: string,
  destinationAmountIn: string,
  salt: string,
  signatureExpiry: number,
  signature: string
): WithdrawSigned => {
  let object: WithdrawSigned = {
    targetTokenAddress: targetTokenAddress,
    destinationWalletAddress: destinationWalletAddress,
    destinationAmountIn: destinationAmountIn,
    salt: salt,
    signatureExpiry: signatureExpiry,
    signature: signature,
  };
  return object;
};

export const getWithdrawSignedAndSwapOneInchObject = (
  destinationWalletAddress: string,
  destinationAmountIn: string,
  destinationAmountOut: string,
  targetFoundryTokenAddress: string,
  targetTokenAddress: string,
  destinationOneInchData: string,
  salt: string,
  signatureExpiry: number,
  signature: string
): WithdrawSignedAndSwapOneInch => {
  let object: WithdrawSignedAndSwapOneInch = {
    destinationWalletAddress: destinationWalletAddress,
    destinationAmountIn: destinationAmountIn,
    destinationAmountOut: destinationAmountOut,
    targetFoundryTokenAddress: targetFoundryTokenAddress,
    targetTokenAddress: targetTokenAddress,
    destinationOneInchData: destinationOneInchData,
    salt: salt,
    signatureExpiry: signatureExpiry,
    signature: signature,
  };
  return object;
};

export const doFoundaryWithdraw = async (
  obj: WithdrawSigned,
  targetNetwork: any,
  targetSigner: any,
  targetChainId: any,
  swapTransactionHash: string,
  gasLimit: string,
  count = 0
): Promise<any> => {
  let result;
  try {
    let dynamicGasPrice;
    if (count > 0) {
      gasLimit = "";
      console.log("gas limit", gasLimit);
    }
    if (
      (await isAllowedDynamicGasValues(targetChainId)) &&
      count < MAX_WITH_DYNAMIC_GAS_WITHDRAW_TRIES &&
      !gasLimit
    ) {
      dynamicGasPrice = await targetNetwork.fiberRouterContract
        .connect(targetSigner)
        .estimateGas.withdrawSigned(
          await (global as any).commonFunctions.getOneInchTokenAddress(
            obj.targetTokenAddress
          ),
          obj.destinationWalletAddress,
          obj.destinationAmountIn,
          obj.salt,
          obj.signatureExpiry,
          obj.signature
        );
      dynamicGasPrice = addBuffer(dynamicGasPrice, 10);
    } else if (gasLimit) {
      dynamicGasPrice = addBuffer(new Big(gasLimit), 10);
    }
    result = await targetNetwork.fiberRouterContract
      .connect(targetSigner)
      .withdrawSigned(
        await (global as any).commonFunctions.getOneInchTokenAddress(
          obj.targetTokenAddress
        ),
        obj.destinationWalletAddress,
        obj.destinationAmountIn,
        obj.salt,
        obj.signatureExpiry,
        obj.signature,
        await getGasForWithdraw(targetChainId, dynamicGasPrice)
      );
  } catch (e) {
    console.log(e);
    sendSlackNotification(swapTransactionHash, e);
    await delay();
    count = count + 1;
    if (count < MAX_WITHDRAW_TRIES) {
      result = await doFoundaryWithdraw(
        obj,
        targetNetwork,
        targetSigner,
        targetChainId,
        swapTransactionHash,
        gasLimit,
        count
      );
    }
  }
  return result;
};

export const doOneInchWithdraw = async (
  obj: WithdrawSignedAndSwapOneInch,
  targetNetwork: any,
  targetSigner: any,
  targetChainId: any,
  swapTransactionHash: string,
  gasLimit: string,
  count = 0
): Promise<any> => {
  let result;
  try {
    let dynamicGasPrice;
    if (count > 0) {
      gasLimit = "";
      console.log("gas limit", gasLimit);
    }
    if (
      (await isAllowedDynamicGasValues(targetChainId)) &&
      count < MAX_WITH_DYNAMIC_GAS_WITHDRAW_TRIES &&
      !gasLimit
    ) {
      dynamicGasPrice = await targetNetwork.fiberRouterContract
        .connect(targetSigner)
        .estimateGas.withdrawSignedAndSwapOneInch(
          obj.destinationWalletAddress,
          obj.destinationAmountIn,
          obj.destinationAmountOut,
          obj.targetFoundryTokenAddress,
          await (global as any).commonFunctions.getOneInchTokenAddress(
            obj.targetTokenAddress
          ),
          obj.destinationOneInchData,
          obj.salt,
          obj.signatureExpiry,
          obj.signature
        );
      dynamicGasPrice = addBuffer(dynamicGasPrice, 10);
    } else if (gasLimit) {
      dynamicGasPrice = addBuffer(new Big(gasLimit), 10);
    }
    result = await targetNetwork.fiberRouterContract
      .connect(targetSigner)
      .withdrawSignedAndSwapOneInch(
        obj.destinationWalletAddress,
        obj.destinationAmountIn,
        obj.destinationAmountOut,
        obj.targetFoundryTokenAddress,
        await (global as any).commonFunctions.getOneInchTokenAddress(
          obj.targetTokenAddress
        ),
        obj.destinationOneInchData,
        obj.salt,
        obj.signatureExpiry,
        obj.signature,
        await getGasForWithdraw(targetChainId, dynamicGasPrice)
      );
  } catch (e) {
    console.log(e);
    sendSlackNotification(swapTransactionHash, e);
    await delay();
    count = count + 1;
    if (count < MAX_WITHDRAW_TRIES) {
      result = await doOneInchWithdraw(
        obj,
        targetNetwork,
        targetSigner,
        targetChainId,
        swapTransactionHash,
        gasLimit,
        count
      );
    }
  }
  return result;
};

export const doOneInchSwap = async (
  obj: SwapOneInch,
  fiberRouter: any
): Promise<any> => {
  let result;
  try {
    if (
      await (global as any).commonFunctions.isNativeToken(
        obj.sourceTokenAddress
      )
    ) {
      result = fiberRouter.methods.swapAndCrossOneInchETH(
        obj.amountOut,
        obj.targetChainId,
        await (global as any).commonFunctions.getOneInchTokenAddress(
          obj.targetTokenAddress
        ),
        obj.destinationWalletAddress,
        obj.sourceOneInchData,
        obj.foundryTokenAddress,
        obj.withdrawalData,
        obj.gasPrice
      );
    } else {
      result = fiberRouter.methods.swapAndCrossOneInch(
        obj.amountIn,
        obj.amountOut,
        obj.targetChainId,
        await (global as any).commonFunctions.getOneInchTokenAddress(
          obj.targetTokenAddress
        ),
        obj.destinationWalletAddress,
        obj.sourceOneInchData,
        obj.sourceTokenAddress,
        obj.foundryTokenAddress,
        obj.withdrawalData
      );
    }
  } catch (e) {
    console.log(e);
  }
  return result;
};

export const getDestinationAmountFromLogs = (
  recipet: any,
  rpcUrl: string,
  destinationAmount: string,
  isOneInch: boolean
): any => {
  if (recipet) {
    let decodedLog: WithdrawOneInchLogs = getLogsFromTransactionReceipt(
      recipet,
      rpcUrl,
      true
    );
    if (decodedLog) {
      console.log("destinationAmountFromLogs:", decodedLog[2]);
      return decodedLog[2];
    }
  }
  return destinationAmount;
};

export const sendSlackNotification = async (swapHash: string, mesg: any) => {
  try {
    let body = `FIBER Engine Backend Alert\nswapHash:\n${swapHash}\n\n${mesg?.toString()}\n========================`;
    await postAlertIntoChannel({ text: body });
  } catch (e) {
    console.log(e);
  }
};

export const getValueForSwap = (
  amount: any,
  gasPrice: any,
  isNative: boolean
) => {
  try {
    console.log(
      "amount:",
      amount,
      "gasPrice:",
      gasPrice,
      "isNative:",
      isNative
    );
    if (isNative) {
      amount = new Big(amount);
      gasPrice = new Big(gasPrice);
      let value = amount.add(gasPrice);
      console.log("value", value.toString());
      return value.toString();
    } else {
      return gasPrice;
    }
  } catch (e) {
    console.log(e);
  }
};

const delay = () => new Promise((res) => setTimeout(res, 10000));
