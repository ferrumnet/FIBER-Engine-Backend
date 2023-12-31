import {
  WithdrawSigned,
  WithdrawSignedAndSwapOneInch,
} from "../../../interfaces/fiberEngineInterface";

import {
  getGasForWithdraw,
  isAllowedDynamicGasValues,
} from "../../middlewares/helpers/gasEstimationHelper";

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
  targetChainId: any
): Promise<any> => {
  let result;
  try {
    let gasLimit;
    if (await isAllowedDynamicGasValues(targetChainId)) {
      gasLimit = await targetNetwork.fiberRouterContract
        .connect(targetSigner)
        .estimateGas.withdrawSigned(
          obj.targetTokenAddress,
          obj.destinationWalletAddress,
          obj.destinationAmountIn,
          obj.salt,
          obj.signatureExpiry,
          obj.signature
        );
    }
    result = await targetNetwork.fiberRouterContract
      .connect(targetSigner)
      .withdrawSigned(
        obj.targetTokenAddress,
        obj.destinationWalletAddress,
        obj.destinationAmountIn,
        obj.salt,
        obj.signatureExpiry,
        obj.signature,
        await getGasForWithdraw(targetChainId, gasLimit)
      );
  } catch (e) {
    console.log(e);
  }
  return result;
};

export const doOneInchWithdraw = async (
  obj: WithdrawSignedAndSwapOneInch,
  targetNetwork: any,
  targetSigner: any,
  targetChainId: any
): Promise<any> => {
  let result;
  try {
    let gasLimit;
    if (await isAllowedDynamicGasValues(targetChainId)) {
      gasLimit = await targetNetwork.fiberRouterContract
        .connect(targetSigner)
        .estimateGas.withdrawSignedAndSwapOneInch(
          obj.destinationWalletAddress,
          obj.destinationAmountIn,
          obj.destinationAmountOut,
          obj.targetFoundryTokenAddress,
          obj.targetTokenAddress,
          obj.destinationOneInchData,
          obj.salt,
          obj.signatureExpiry,
          obj.signature
        );
    }
    result = await targetNetwork.fiberRouterContract
      .connect(targetSigner)
      .withdrawSignedAndSwapOneInch(
        obj.destinationWalletAddress,
        obj.destinationAmountIn,
        obj.destinationAmountOut,
        obj.targetFoundryTokenAddress,
        obj.targetTokenAddress,
        obj.destinationOneInchData,
        obj.salt,
        obj.signatureExpiry,
        obj.signature,
        await getGasForWithdraw(targetChainId, gasLimit)
      );
  } catch (e) {
    console.log(e);
  }
  return result;
};
