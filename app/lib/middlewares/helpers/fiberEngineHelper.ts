const { Big } = require("big.js");
import {
  SwapOneInch,
  WithdrawSigned,
  WithdrawSignedAndSwapOneInch,
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
  signature: string,
  targetNetwork: any,
  targetSigner: any,
  targetChainId: string,
  swapTransactionHash: string,
  gasLimit: string
): WithdrawSigned => {
  let object: WithdrawSigned = {
    targetTokenAddress: targetTokenAddress,
    destinationWalletAddress: destinationWalletAddress,
    destinationAmountIn: destinationAmountIn,
    salt: salt,
    signatureExpiry: signatureExpiry,
    signature: signature,
    targetNetwork: targetNetwork,
    targetSigner: targetSigner,
    targetChainId: targetChainId,
    swapTransactionHash: swapTransactionHash,
    gasLimit: gasLimit,
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
  signature: string,
  destinationOneInchSelector: string,
  targetNetwork: any,
  targetSigner: any,
  targetChainId: string,
  swapTransactionHash: string,
  gasLimit: string
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
    oneInchSelector: destinationOneInchSelector,
    targetNetwork: targetNetwork,
    targetSigner: targetSigner,
    targetChainId: targetChainId,
    swapTransactionHash: swapTransactionHash,
    gasLimit: gasLimit,
    aggregateRouterContractAddress:
      targetNetwork.aggregateRouterContractAddress,
  };
  return object;
};

export const doFoundaryWithdraw = async (
  obj: WithdrawSigned,
  extraBuffer: number,
  count = 0
): Promise<any> => {
  let result: any;
  let dynamicGasPrice: any;
  try {
    let isAllowedDynamicGas = await isAllowedDynamicGasValues(
      obj.targetChainId
    );
    if (count > 0) {
      obj.gasLimit = "";
    }
    if (
      isAllowedDynamicGas &&
      count < MAX_WITH_DYNAMIC_GAS_WITHDRAW_TRIES &&
      !obj.gasLimit
    ) {
      dynamicGasPrice = await obj.targetNetwork.fiberRouterContract
        .connect(obj.targetSigner)
        .estimateGas.withdrawSigned(
          await (global as any).commonFunctions.getOneInchTokenAddress(
            obj.targetTokenAddress
          ),
          obj.destinationWalletAddress,
          obj.destinationAmountIn,
          obj.salt,
          obj.signatureExpiry,
          obj.signature,
          false
        );
      dynamicGasPrice = await addBuffer(
        dynamicGasPrice,
        obj.targetChainId,
        true,
        extraBuffer
      );
    } else if (isAllowedDynamicGas && obj.gasLimit) {
      dynamicGasPrice = await addBuffer(
        new Big(obj.gasLimit),
        obj.targetChainId,
        true,
        extraBuffer
      );
    }
    console.log("dynamicGasPrice", dynamicGasPrice);
    result = await obj.targetNetwork.fiberRouterContract
      .connect(obj.targetSigner)
      .withdrawSigned(
        await (global as any).commonFunctions.getOneInchTokenAddress(
          obj.targetTokenAddress
        ),
        obj.destinationWalletAddress,
        obj.destinationAmountIn,
        obj.salt,
        obj.signatureExpiry,
        obj.signature,
        false,
        await getGasForWithdraw(obj.targetChainId, dynamicGasPrice)
      );
  } catch (e) {
    console.log(e);
    sendSlackNotification(
      obj.swapTransactionHash,
      e,
      getGasLimitTagForSlackNotification(dynamicGasPrice, obj.gasLimit)
    );
    await delay();
    count = count + 1;
    if (count < MAX_WITHDRAW_TRIES) {
      result = await doFoundaryWithdraw(obj, count);
    }
  }
  result.dynamicGasPrice = dynamicGasPrice;
  return result;
};

export const doOneInchWithdraw = async (
  obj: WithdrawSignedAndSwapOneInch,
  extraBuffer: number,
  count = 0
): Promise<any> => {
  let result: any;
  let dynamicGasPrice: any;
  try {
    let isAllowedDynamicGas = await isAllowedDynamicGasValues(
      obj.targetChainId
    );
    if (count > 0) {
      obj.gasLimit = "";
    }
    if (
      isAllowedDynamicGas &&
      count < MAX_WITH_DYNAMIC_GAS_WITHDRAW_TRIES &&
      !obj.gasLimit
    ) {
      dynamicGasPrice = await obj.targetNetwork.fiberRouterContract
        .connect(obj.targetSigner)
        .estimateGas.withdrawSignedAndSwapRouter(
          obj.destinationWalletAddress,
          obj.destinationAmountIn,
          obj.destinationAmountOut,
          obj.targetFoundryTokenAddress,
          await (global as any).commonFunctions.getOneInchTokenAddress(
            obj.targetTokenAddress
          ),
          obj.aggregateRouterContractAddress,
          obj.destinationOneInchData,
          obj.salt,
          obj.signatureExpiry,
          obj.signature,
          false
        );
      dynamicGasPrice = await addBuffer(
        dynamicGasPrice,
        obj.targetChainId,
        true,
        extraBuffer
      );
    } else if (isAllowedDynamicGas && obj.gasLimit) {
      dynamicGasPrice = await addBuffer(
        new Big(obj.gasLimit),
        obj.targetChainId,
        true,
        extraBuffer
      );
    }
    console.log("dynamicGasPrice", dynamicGasPrice);
    result = await obj.targetNetwork.fiberRouterContract
      .connect(obj.targetSigner)
      .withdrawSignedAndSwapRouter(
        obj.destinationWalletAddress,
        obj.destinationAmountIn,
        obj.destinationAmountOut,
        obj.targetFoundryTokenAddress,
        await (global as any).commonFunctions.getOneInchTokenAddress(
          obj.targetTokenAddress
        ),
        obj.aggregateRouterContractAddress,
        obj.destinationOneInchData,
        obj.salt,
        obj.signatureExpiry,
        obj.signature,
        false,
        await getGasForWithdraw(obj.targetChainId, dynamicGasPrice)
      );
  } catch (e) {
    console.log(e);
    sendSlackNotification(
      obj.swapTransactionHash,
      e,
      getGasLimitTagForSlackNotification(dynamicGasPrice, obj.gasLimit)
    );
    await delay();
    count = count + 1;
    if (count < MAX_WITHDRAW_TRIES) {
      result = await doOneInchWithdraw(obj, count);
    }
  }
  result.dynamicGasPrice = dynamicGasPrice;
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
      result = fiberRouter.methods.swapAndCrossRouterETH(
        obj.amountOut,
        obj.foundryTokenAddress,
        obj.gasPrice,
        obj.aggregateRouterContractAddress,
        obj.sourceOneInchData,
        obj.targetChainId,
        await (global as any).commonFunctions.getOneInchTokenAddress(
          obj.targetTokenAddress
        ),
        obj.destinationWalletAddress,
        obj.withdrawalData,
        false
      );
    } else {
      result = fiberRouter.methods.swapAndCrossRouter(
        obj.amountIn,
        obj.amountOut,
        obj.sourceTokenAddress,
        obj.foundryTokenAddress,
        obj.aggregateRouterContractAddress,
        obj.sourceOneInchData,
        obj.targetChainId,
        await (global as any).commonFunctions.getOneInchTokenAddress(
          obj.targetTokenAddress
        ),
        obj.destinationWalletAddress,
        obj.withdrawalData,
        false
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
        obj.aggregateRouterContractAddress,
        obj.destinationOneInchData
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
        obj.aggregateRouterContractAddress,
        obj.destinationOneInchData
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
  isNative: boolean,
  isSameNetwork = false
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
    if (isNative && isSameNetwork) {
      return amount;
    } else if (isNative) {
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

export const isOutOfGasError = async (
  error: any,
  totalGas: any
): Promise<Boolean> => {
  try {
    const gasUsed = error?.receipt?.gasUsed?.toString();
    if (gasUsed) {
      console.log("gas used:", gasUsed, "totalGas:", totalGas);
      let percentage: any = (100 * Number(gasUsed)) / Number(totalGas);
      percentage = percentage.toFixed(2);
      console.log(percentage, Number(percentage));
      if (Number(percentage) > 98) {
        console.log("isOutOfGasError: true");
        return true;
      }
    }
  } catch (e) {
    console.log(e);
  }
  return false;
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
