import {
  WithdrawSigned,
  WithdrawSignedAndSwapOneInch,
} from "../../../interfaces/fiberEngineInterface";

import { getGasForWithdraw } from "../../middlewares/helpers/gasEstimationHelper";

export const getWithdrawSignedObject = (
  targetTokenAddress,
  destinationWalletAddress,
  destinationAmountIn,
  salt,
  signatureExpiry,
  signature
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
  destinationWalletAddress,
  destinationAmountIn,
  destinationAmountOut,
  targetFoundryTokenAddress,
  targetTokenAddress,
  destinationOneInchData,
  salt,
  signatureExpiry,
  signature
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
  targetNetwork,
  targetSigner,
  targetChainId
): Promise<any> => {
  let result;
  try {
    const gasLimit = await targetNetwork.fiberRouterContract
      .connect(targetSigner)
      .estimateGas.withdrawSigned(
        obj.targetTokenAddress,
        obj.destinationWalletAddress,
        obj.destinationAmountIn,
        obj.salt,
        obj.signatureExpiry,
        obj.signature
      );

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
  targetNetwork,
  targetSigner,
  targetChainId
): Promise<any> => {
  let result;
  try {
    const gasLimit = await targetNetwork.fiberRouterContract
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
