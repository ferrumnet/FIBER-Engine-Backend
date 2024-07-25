const { Big } = require("big.js");
import {
  SwapOneInch,
  WithdrawSigned,
  WithdrawSignedAndSwapOneInch,
  WithdrawOneInchLogs,
  SwapSameNetwork,
  Swap,
} from "../../../interfaces/fiberEngineInterface";
import {
  getGasForWithdraw,
  isAllowedDynamicGasValues,
  addBuffer,
} from "../../middlewares/helpers/gasFeeHelpers/gasEstimationHelper";
import { getLogsFromTransactionReceipt } from "../../middlewares/helpers/web3Helpers/web3Helper";
import { postAlertIntoChannel } from "../../httpCalls/slackAxiosHelper";
import { getAttestation } from "../../middlewares/helpers/cctpHelpers/cctpHelper";
import { messageTransmitter } from "../../middlewares/helpers/cctpHelpers/cctpContractHelper";
import { Contract } from "../../../interfaces/forgeInterface";
import { chooseProviderAndGetData } from "../helpers/tokenQuoteAndTypeHelpers/quoteProvidersHelper";
import { getProviderApiThreshold } from "./configurationHelper";
import { createEVMResponse } from "./withdrawResponseHelper";
import {
  attestationSignatureError,
  genericProviderError,
} from "./stringHelper";

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
  gasLimit: string,
  isCCTP: boolean
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
    isCCTP: isCCTP,
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
  gasLimit: string,
  isCCTP: boolean
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
    isCCTP: isCCTP,
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
          await (global as any).commonFunctions.getNativeTokenAddress(
            obj.targetTokenAddress
          ),
          obj.destinationWalletAddress,
          obj.destinationAmountIn,
          obj.salt,
          obj.signatureExpiry,
          obj.signature,
          obj.isCCTP
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
        await (global as any).commonFunctions.getNativeTokenAddress(
          obj.targetTokenAddress
        ),
        obj.destinationWalletAddress,
        obj.destinationAmountIn,
        obj.salt,
        obj.signatureExpiry,
        obj.signature,
        obj.isCCTP,
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
      result = await doFoundaryWithdraw(obj, extraBuffer, count);
    }
  }
  if (result) {
    result.dynamicGasPrice = dynamicGasPrice;
  }
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
          await (global as any).commonFunctions.getNativeTokenAddress(
            obj.targetTokenAddress
          ),
          obj.aggregateRouterContractAddress,
          obj.destinationOneInchData,
          obj.salt,
          obj.signatureExpiry,
          obj.signature,
          obj.isCCTP
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
        await (global as any).commonFunctions.getNativeTokenAddress(
          obj.targetTokenAddress
        ),
        obj.aggregateRouterContractAddress,
        obj.destinationOneInchData,
        obj.salt,
        obj.signatureExpiry,
        obj.signature,
        obj.isCCTP,
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
      result = await doOneInchWithdraw(obj, extraBuffer, count);
    }
  }
  if (result) {
    result.dynamicGasPrice = dynamicGasPrice;
  }
  return result;
};

export const doSwap = async (obj: Swap, fiberRouter: any): Promise<any> => {
  let result;
  try {
    result = fiberRouter.methods.swapSigned(
      obj.sourceTokenAddress,
      obj.amount,
      {
        targetNetwork: obj.targetChainId,
        targetToken: await (
          global as any
        ).commonFunctions.getNativeTokenAddress(obj.targetTokenAddress),
        targetAddress: obj.destinationWalletAddress,
      },
      obj.withdrawalData,
      obj.isCCTP,
      obj.isStargate,
      obj.feeDistribution
    );
  } catch (e) {
    console.log(e);
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
      result = fiberRouter.methods.swapSignedAndCrossRouterETH(
        obj.amountOut,
        obj.foundryTokenAddress,
        obj.gasPrice,
        obj.aggregateRouterContractAddress,
        obj.sourceOneInchData,
        {
          targetNetwork: obj.targetChainId,
          targetToken: await (
            global as any
          ).commonFunctions.getNativeTokenAddress(obj.targetTokenAddress),
          targetAddress: obj.destinationWalletAddress,
        },
        obj.withdrawalData,
        obj.isCCTP,
        obj.feeDistribution
      );
    } else {
      result = fiberRouter.methods.swapSignedAndCrossRouter(
        obj.amountIn,
        obj.amountOut,
        obj.sourceTokenAddress,
        obj.foundryTokenAddress,
        obj.aggregateRouterContractAddress,
        obj.sourceOneInchData,
        {
          targetNetwork: obj.targetChainId,
          targetToken: await (
            global as any
          ).commonFunctions.getNativeTokenAddress(obj.targetTokenAddress),
          targetAddress: obj.destinationWalletAddress,
        },
        obj.withdrawalData,
        obj.isCCTP,
        obj.feeDistribution
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
        await (global as any).commonFunctions.getNativeTokenAddress(
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
        await (global as any).commonFunctions.getNativeTokenAddress(
          obj.sourceTokenAddress
        ),
        await (global as any).commonFunctions.getNativeTokenAddress(
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

export const doCCTPFlow = async (
  network: any,
  messageBytes: string,
  messageHash: string,
  isCCTP: boolean
) => {
  console.log(
    "isCCTP",
    isCCTP,
    "network.rpcUrl",
    network.rpcUrl,
    "chainId",
    network.chainId
  );
  if (!isCCTP) {
    return "";
  }
  let contract: Contract = {
    rpcUrl: network.rpcUrl,
    contractAddress: network.cctpmessageTransmitterAddress,
  };
  let attestationSignature = await getAttestation(messageHash);
  console.log("attestationSignature:", attestationSignature);
  sendSlackNotification(
    messageHash,
    "attestationSignature: " + attestationSignature,
    null
  );
  if (!attestationSignature) {
    return attestationSignatureError;
  }
  await doMessageTransmitter(
    contract,
    network,
    messageBytes,
    attestationSignature
  );
};

const doMessageTransmitter = async (
  contract: any,
  network: any,
  messageBytes: string,
  attestationSignature: string
) => {
  for (let count = 0; count < 5; count++) {
    if (
      await messageTransmitter(
        contract,
        network,
        messageBytes,
        attestationSignature
      )
    ) {
      return "";
    }
    await delay();
  }
};

export const getLatestCallData = async (
  walletAddress: string,
  chainId: string,
  src: any,
  dst: string,
  amount: string,
  slippage: string,
  from: string,
  to: string,
  recursionCount = 0
) => {
  let providerResponse: any = await chooseProviderAndGetData(
    walletAddress,
    chainId,
    src,
    dst,
    amount,
    slippage,
    from,
    to,
    true
  );
  if (
    providerResponse?.responseMessage &&
    providerResponse?.responseMessage == genericProviderError &&
    recursionCount < (await getProviderApiThreshold())
  ) {
    console.log("responseMessage", providerResponse?.responseMessage);
    await delay();
    recursionCount = recursionCount + 1;
    providerResponse = await getLatestCallData(
      walletAddress,
      chainId,
      src,
      dst,
      amount,
      slippage,
      from,
      to,
      recursionCount
    );
  }
  return providerResponse?.callData ? providerResponse?.callData : "";
};

export const handleWithdrawalErrors = async (
  swapTransactionHash: string,
  error: string,
  code: any
) => {
  sendSlackNotification(swapTransactionHash, "Error: " + error, "Not used");
  let receipt = { code: code };
  let withdrawResponse = createEVMResponse(receipt);
  let data: any = {};
  data.responseCode = withdrawResponse?.responseCode;
  data.responseMessage = withdrawResponse?.responseMessage;
  return data;
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
