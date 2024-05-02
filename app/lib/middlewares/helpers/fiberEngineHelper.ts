const { Big } = require("big.js");
import {
  SwapRouter,
  WithdrawSigned,
  WithdrawSignedAndSwapRouter,
  WithdrawOneInchLogs,
  SwapSameNetwork,
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

export const getWithdrawSignedAndSwapRouterObject = (
  destinationWalletAddress: string,
  destinationAmountIn: string,
  destinationAmountOut: string,
  targetFoundryTokenAddress: string,
  targetTokenAddress: string,
  destinationAggregatorRouterAddress: string,
  destinationAggregatorRouterCalldata: string,
  salt: string,
  signatureExpiry: number,
  signature: string,
  cctpType: boolean
): WithdrawSignedAndSwapRouter => {
  let object: WithdrawSignedAndSwapRouter = {
    destinationWalletAddress: destinationWalletAddress,
    destinationAmountIn: destinationAmountIn,
    destinationAmountOut: destinationAmountOut,
    targetFoundryTokenAddress: targetFoundryTokenAddress,
    targetTokenAddress: targetTokenAddress,
    destinationAggregatorRouterAddress: destinationAggregatorRouterAddress,
    destinationAggregatorRouterCalldata: destinationAggregatorRouterCalldata,
    salt: salt,
    signatureExpiry: signatureExpiry,
    signature: signature,
    cctpType: cctpType,
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
  let dynamicGasPrice: any;
  try {
    let isAllowedDynamicGas = await isAllowedDynamicGasValues(targetChainId);
    if (count > 0) {
      gasLimit = "";
    }
    if (
      isAllowedDynamicGas &&
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
      dynamicGasPrice = await addBuffer(dynamicGasPrice, targetChainId, true);
    } else if (isAllowedDynamicGas && gasLimit) {
      dynamicGasPrice = await addBuffer(new Big(gasLimit), targetChainId, true);
    }
    console.log("dynamicGasPrice", dynamicGasPrice);
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
    sendSlackNotification(
      swapTransactionHash,
      e,
      getGasLimitTagForSlackNotification(dynamicGasPrice, gasLimit)
    );
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
  obj: WithdrawSignedAndSwapRouter,
  targetNetwork: any,
  targetSigner: any,
  targetChainId: any,
  swapTransactionHash: string,
  gasLimit: string,
  count = 0
): Promise<any> => {
  let result;
  let dynamicGasPrice: any;
  try {
    let isAllowedDynamicGas = await isAllowedDynamicGasValues(targetChainId);
    if (count > 0) {
      gasLimit = "";
    }
    if (
      isAllowedDynamicGas &&
      count < MAX_WITH_DYNAMIC_GAS_WITHDRAW_TRIES &&
      !gasLimit
    ) {
      dynamicGasPrice = await targetNetwork.fiberRouterContract
        .connect(targetSigner)
        .estimateGas.withdrawSignedAndSwapRouter(
          obj.destinationWalletAddress,
          obj.destinationAmountIn,
          obj.destinationAmountOut,
          obj.targetFoundryTokenAddress,
          await (global as any).commonFunctions.getOneInchTokenAddress(
            obj.targetTokenAddress
          ),
          obj.destinationAggregatorRouterAddress,
          obj.destinationAggregatorRouterCalldata,
          obj.salt,
          obj.signatureExpiry,
          obj.signature,
          obj.cctpType
        );
      dynamicGasPrice = await addBuffer(dynamicGasPrice, targetChainId, true);
    } else if (isAllowedDynamicGas && gasLimit) {
      dynamicGasPrice = await addBuffer(new Big(gasLimit), targetChainId, true);
    }
    console.log("dynamicGasPrice", dynamicGasPrice);
    result = await targetNetwork.fiberRouterContract
      .connect(targetSigner)
      .withdrawSignedAndSwapRouter(
        obj.destinationWalletAddress,
        obj.destinationAmountIn,
        obj.destinationAmountOut,
        obj.targetFoundryTokenAddress,
        await (global as any).commonFunctions.getOneInchTokenAddress(
          obj.targetTokenAddress
        ),
        obj.destinationAggregatorRouterAddress,
          obj.destinationAggregatorRouterCalldata,
        obj.salt,
        obj.signatureExpiry,
        obj.signature,
        obj.cctpType,
        await getGasForWithdraw(targetChainId, dynamicGasPrice)
      );
  } catch (e) {
    console.log(e);
    sendSlackNotification(
      swapTransactionHash,
      e,
      getGasLimitTagForSlackNotification(dynamicGasPrice, gasLimit)
    );
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
  obj: SwapRouter,
  fiberRouter: any
): Promise<any> => {
  let result;
  try {
    if (
      await (global as any).commonFunctions.isNativeToken(
        obj.sourceTokenAddress
      )
    ) {
      result = fiberRouter.methods.swapAndCrossRouterETH(
        obj.minAmountOut,
        obj.foundryTokenAddress,
        obj.gasPrice,
        obj.aggregatorRouterAddress,
        obj.aggregatorRouterCalldata,
        obj.targetChainId,
        await (global as any).commonFunctions.getOneInchTokenAddress(
          obj.targetTokenAddress
        ),
        obj.destinationWalletAddress,
        obj.withdrawalData,
        obj.cctpType
      );
    } else {
      result = fiberRouter.methods.swapAndCrossRouter(
        obj.amountIn,
        obj.minAmountOut,
        obj.sourceTokenAddress,
        obj.foundryTokenAddress,
        obj.aggregatorRouterAddress,
        obj.aggregatorRouterCalldata,
        obj.targetChainId,
        await (global as any).commonFunctions.getOneInchTokenAddress(
          obj.targetTokenAddress
        ),
        obj.destinationWalletAddress,
        obj.withdrawalData,
        obj.cctpType
      );
    }
  } catch (e) {
    console.log(e);
  }
  return result;
};

export const doSameNetworkSwap = async (
  obj: SwapSameNetwork,
  fiberRouter: any
): Promise<any> => {
  let result;
  try {
    console.log(obj);
    if (
      await (global as any).commonFunctions.isNativeToken(
        obj.sourceTokenAddress
      )
    ) {
      result = fiberRouter.methods.swapOnSameNetworkETH(
        obj.amountOut,
        await (global as any).commonFunctions.getOneInchTokenAddress(
          obj.targetTokenAddress
        ),
        obj.destinationWalletAddress,
        obj.destinationOneInchData,
        obj.oneInchSelector
      );
    } else {
      result = fiberRouter.methods.swapOnSameNetwork(
        obj.amountIn,
        obj.amountOut,
        await (global as any).commonFunctions.getOneInchTokenAddress(
          obj.sourceTokenAddress
        ),
        await (global as any).commonFunctions.getOneInchTokenAddress(
          obj.targetTokenAddress
        ),
        obj.destinationWalletAddress,
        obj.destinationOneInchData,
        obj.oneInchSelector
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

export const sendSlackNotification = async (
  swapHash: string,
  mesg: any,
  gasLimitTag: any
) => {
  try {
    let body = `FIBER Engine Backend Alert\nswapHash:\n${swapHash}\ngasLimit:\n${gasLimitTag}\n\n${mesg?.toString()}\n========================`;
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

const getGasLimitTagForSlackNotification = (
  dynamicGasPrice: any,
  gasLimit: any
) => {
  let type = "Secondary";
  if (gasLimit) {
    type = "Primary";
  }
  return dynamicGasPrice?.toString() + " " + type;
};

const delay = () => new Promise((res) => setTimeout(res, 10000));
