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
} from "../../middlewares/helpers/gasEstimationHelper";
import { getLogsFromTransactionReceipt } from "../../middlewares/helpers/web3Helpers/web3Helper";

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
  isDynamicGasLimit = true
): Promise<any> => {
  let result;
  try {
    let gasLimit;
    if ((await isAllowedDynamicGasValues(targetChainId)) && isDynamicGasLimit) {
      gasLimit = await targetNetwork.fiberRouterContract
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
      gasLimit = addBuffer(gasLimit);
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
        await getGasForWithdraw(targetChainId, gasLimit)
      );
  } catch (e) {
    console.log(e);
    if (isDynamicGasLimit) {
      result = await doFoundaryWithdraw(
        obj,
        targetNetwork,
        targetSigner,
        targetChainId,
        false
      );
    }
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

export const doOneInchWithdraw = async (
  obj: WithdrawSignedAndSwapOneInch,
  targetNetwork: any,
  targetSigner: any,
  targetChainId: any,
  isDynamicGasLimit = true
): Promise<any> => {
  let result;
  try {
    let gasLimit;
    if ((await isAllowedDynamicGasValues(targetChainId)) && isDynamicGasLimit) {
      gasLimit = await targetNetwork.fiberRouterContract
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
      gasLimit = addBuffer(gasLimit);
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
        await getGasForWithdraw(targetChainId, gasLimit)
      );
  } catch (e) {
    console.log(e);
    if (isDynamicGasLimit) {
      result = await doOneInchWithdraw(
        obj,
        targetNetwork,
        targetSigner,
        targetChainId,
        false
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
        obj.withdrawalData
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
