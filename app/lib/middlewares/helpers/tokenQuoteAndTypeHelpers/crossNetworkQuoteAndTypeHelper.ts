var tokenAbi = require("../../../../../config/Token.json");
var { ethers } = require("ethers");
var { Big } = require("big.js");
import {
  getSourceAssetTypes,
  getTargetAssetTypes,
} from "../tokenQuoteAndTypeHelpers/assetTypeHelper";
import { checkForCCTPAndStargate } from "../liquidityHelper";
import { swapIsNotAvailable } from "../stringHelper";
import { getSourceAmountOut } from "../fiberNodeHelper";
import { chooseProviderAndGetData } from "../tokenQuoteAndTypeHelpers/quoteProvidersHelper";
import {
  getDataAfterCutDistributionFee,
  getFeeDistributionObject,
  getSourceAmountWithFee,
} from "../feeDistribution/feeDistributionHelper";
import {
  DestinationCrossNetowrObject,
  SourceCrossNetowrObject,
} from "../../../../interfaces/quoteAndTypeInterface";
import { FeeDistribution } from "../../../../interfaces/feeDistributionInterface";
import { isStargateFlow } from "../stargateHelpers/stargateHelper";

export const getQouteAndTypeForCrossNetworks = async (
  sourceChainId: any,
  sourceTokenAddress: any,
  targetChainId: any,
  targetTokenAddress: any,
  inputAmount: any,
  sourceWalletAddress: string,
  destinationWalletAddress: string,
  gasEstimationDestinationAmount: string,
  sourceSlippage: string,
  destinationSlippage: string,
  referralCode: string
) => {
  let common = (global as any).commonFunctions;
  const sourceNetwork =
    common.getNetworkByChainId(sourceChainId).multiswapNetworkFIBERInformation;
  const targetNetwork =
    common.getNetworkByChainId(targetChainId).multiswapNetworkFIBERInformation;

  let targetAssetType;
  let sourceAssetType;
  let sourceBridgeAmount: any;
  let sourceCallData;
  let destinationCallData;
  let destinationAmountOut;
  let minDestinationAmountOut;
  let machineSourceAmountIn: any;
  let machineSourceAmountOut: any;
  let machineDestinationAmountIn: any;
  let machineDestinationAmountOut: any;
  let feeDistribution: FeeDistribution;
  let totalPlatformFee: any;
  let targetFoundryTokenAddress;
  let isCCTP = false;
  let isStargate = false;

  // get target type for stargate flow
  let targetTypeResponse = await getTargetAssetTypes(
    targetNetwork,
    await common.getWrappedNativeTokenAddress(targetTokenAddress, targetChainId)
  );
  const isTargetTokenFoundry = targetTypeResponse.isFoundryAsset;

  let sResponse: SourceCrossNetowrObject = await handleSource(
    sourceChainId,
    targetChainId,
    sourceTokenAddress,
    sourceWalletAddress,
    inputAmount,
    gasEstimationDestinationAmount,
    sourceSlippage,
    referralCode,
    sourceNetwork,
    isTargetTokenFoundry
  );
  sourceAssetType = sResponse?.sourceAssetType;
  feeDistribution = sResponse?.feeDistribution;
  sourceBridgeAmount = sResponse?.sourceAmountInNumber;
  machineSourceAmountIn = sResponse?.sourceAmountIn;
  machineSourceAmountOut = sResponse?.sourceAmountOut;
  sourceCallData = sResponse?.sourceCallData;
  totalPlatformFee = sResponse?.totalPlatformFee;

  let dResponse: DestinationCrossNetowrObject = await handleDestination(
    sourceChainId,
    targetChainId,
    targetTokenAddress,
    destinationWalletAddress,
    gasEstimationDestinationAmount,
    destinationSlippage,
    targetNetwork,
    sResponse.sourceAmountInNumber,
    sResponse.sourceSlippageInNumber,
    sourceWalletAddress,
    sourceAssetType
  );
  targetAssetType = dResponse?.targetAssetType;
  destinationCallData = dResponse?.destinationCallData;
  destinationAmountOut = dResponse?.destinationAmountOutInNumber;
  minDestinationAmountOut = dResponse?.minDestinationAmountOut;
  machineDestinationAmountIn = dResponse?.destinationAmountIn;
  machineDestinationAmountOut = dResponse?.destinationAmountOut;
  targetFoundryTokenAddress = dResponse?.targetFoundryTokenAddress;
  isCCTP = dResponse?.isCCTP;
  isStargate = dResponse?.isStargate;

  let data: any = {
    source: {},
    destination: {},
    isCCTP: isCCTP,
    isStargate: isStargate,
  };
  data.source.type = sourceAssetType;
  data.source.amount = inputAmount;
  data.source.sourceAmountIn = machineSourceAmountIn;
  data.source.sourceAmountOut = getSourceAmountWithFee(
    machineSourceAmountOut,
    totalPlatformFee
  );
  data.source.usdcAmount = sResponse?.usdcAmount;
  data.source.callData = sourceCallData;

  machineDestinationAmountOut = machineDestinationAmountOut
    ? machineDestinationAmountOut
    : machineDestinationAmountIn;
  data.destination.type = targetAssetType;
  data.destination.amount = destinationAmountOut;
  data.destination.minAmount = minDestinationAmountOut;
  data.destination.destinationAmountIn = machineDestinationAmountIn;
  data.destination.destinationAmountOut = machineDestinationAmountOut;
  data.destination.usdcAmount = dResponse?.usdcAmount;
  data.destination.callData = destinationCallData;
  data.platformFee = sResponse?.totalPlatformFeeInNumber;
  if (!gasEstimationDestinationAmount) {
    data.feeDistribution = await getFeeDistributionObject(
      feeDistribution,
      sourceNetwork,
      machineSourceAmountIn,
      data.source.sourceAmountOut,
      machineDestinationAmountIn,
      machineDestinationAmountOut
    );
  }
  return data;
};

const handleSource = async (
  sourceChainId: any,
  targetChainId: any,
  sourceTokenAddress: any,
  sourceWalletAddress: string,
  inputAmount: any,
  gasEstimationDestinationAmount: string,
  sourceSlippage: string,
  referralCode: string,
  sourceNetwork: any,
  isTargetTokenFoundry: boolean
) => {
  const common = (global as any).commonFunctions;
  const utils = (global as any).utils;
  let response: SourceCrossNetowrObject = {
    sourceAssetType: undefined,
    sourceAmountInNumber: undefined,
    sourceCallData: undefined,
    sourceAmountIn: undefined,
    sourceAmountOut: undefined,
    feeDistribution: undefined,
    sourceSlippageInNumber: "0",
    totalPlatformFee: "0",
    totalPlatformFeeInNumber: "",
    usdcAmount: undefined,
  };
  if (gasEstimationDestinationAmount) {
    return response;
  }
  const sourceTokenContract = new ethers.Contract(
    await common.getWrappedNativeTokenAddress(
      sourceTokenAddress,
      sourceChainId
    ),
    tokenAbi.abi,
    sourceNetwork.provider
  );
  const sourceFoundryTokenContract = new ethers.Contract(
    sourceNetwork.foundryTokenAddress,
    tokenAbi.abi,
    sourceNetwork.provider
  );
  const sourceTokenDecimal = await sourceTokenContract.decimals();
  const sourceFoundryTokenDecimal = await sourceFoundryTokenContract.decimals();
  response.sourceAmountIn = common.numberIntoDecimals__(
    inputAmount,
    sourceTokenDecimal
  );
  let sourceTypeResponse = await getSourceAssetTypes(
    sourceNetwork,
    await common.getWrappedNativeTokenAddress(
      sourceTokenAddress,
      sourceChainId
    ),
    response.sourceAmountIn
  );
  const isFoundryAsset = sourceTypeResponse.isFoundryAsset;
  if (isFoundryAsset) {
    response.sourceAssetType = utils.assetType.FOUNDARY;
    response.sourceAmountOut = response.sourceAmountIn;
    response.usdcAmount = inputAmount;
    const isStargate = await isStargateFlow(
      isFoundryAsset,
      isTargetTokenFoundry,
      sourceChainId,
      targetChainId
    );
    const { error, amountAfterCut, totalFee, data } =
      await getDataAfterCutDistributionFee(
        referralCode,
        sourceWalletAddress,
        response.sourceAmountOut,
        sourceFoundryTokenDecimal,
        isStargate
      );
    if (error) {
      throw error;
    }
    response.totalPlatformFee = totalFee;
    response.sourceAmountOut = amountAfterCut;
    response.feeDistribution = data;
    response.sourceAmountInNumber = common.decimalsIntoNumber(
      response.sourceAmountOut,
      sourceFoundryTokenDecimal
    );
  } else {
    response.sourceAssetType = utils.assetType.ONE_INCH;
    let responseProvider: any = await chooseProviderAndGetData(
      sourceWalletAddress,
      sourceChainId,
      await common.getWrappedNativeTokenAddress(
        sourceTokenAddress,
        sourceChainId
      ),
      sourceNetwork?.foundryTokenAddress,
      response.sourceAmountIn,
      sourceSlippage,
      sourceNetwork?.fiberRouter,
      sourceNetwork?.fiberRouter,
      false
    );
    response.sourceCallData = responseProvider.callData;
    response.sourceAmountOut = responseProvider.amounts;
    response.usdcAmount = common.decimalsIntoNumber(
      responseProvider.amounts,
      sourceFoundryTokenDecimal
    );
    response.sourceAmountOut = await common.addSlippageInDecimal(
      response.sourceAmountOut,
      sourceSlippage
    );
    response.sourceSlippageInNumber = getSlippageInNumber(
      responseProvider.amounts,
      response.sourceAmountOut,
      sourceFoundryTokenDecimal
    );
    console.log(
      "slippageInNumber:",
      response.sourceSlippageInNumber.toString()
    );
    const { error, amountAfterCut, totalFee, data } =
      await getDataAfterCutDistributionFee(
        referralCode,
        sourceWalletAddress,
        response.sourceAmountOut,
        sourceFoundryTokenDecimal,
        false
      );
    if (error) {
      throw error;
    }
    response.totalPlatformFee = totalFee;
    response.sourceAmountOut = amountAfterCut;
    response.feeDistribution = data;
    response.sourceAmountInNumber = common.decimalsIntoNumber(
      response.sourceAmountOut,
      sourceFoundryTokenDecimal
    );
  }
  response.totalPlatformFeeInNumber = getPlatformFeeInNumber(
    response.totalPlatformFee,
    sourceFoundryTokenDecimal
  );
  return response;
};

const handleDestination = async (
  sourceChainId: string,
  targetChainId: string,
  targetTokenAddress: any,
  destinationWalletAddress: string,
  gasEstimationDestinationAmount: string,
  destinationSlippage: string,
  targetNetwork: any,
  sourceAmountInNumber: any,
  sourceSlippageInNumber: any,
  sourceWalletAddress: any,
  sourceAssetType: string
) => {
  const common = (global as any).commonFunctions;
  const utils = (global as any).utils;
  let response: DestinationCrossNetowrObject = {
    targetAssetType: undefined,
    destinationCallData: undefined,
    destinationAmountOutInNumber: undefined,
    minDestinationAmountOut: undefined,
    destinationAmountIn: undefined,
    destinationAmountOut: undefined,
    targetFoundryTokenAddress: undefined,
    isCCTP: false,
    isStargate: false,
    usdcAmount: undefined,
  };

  const targetTokenContract = new ethers.Contract(
    await common.getWrappedNativeTokenAddress(
      targetTokenAddress,
      targetChainId
    ),
    tokenAbi.abi,
    targetNetwork.provider
  );
  if (
    targetChainId == utils.arbitrumChainID &&
    targetTokenAddress == utils.cFRMTokenAddress
  ) {
    response.targetFoundryTokenAddress = targetTokenAddress;
  } else {
    response.targetFoundryTokenAddress = targetNetwork.foundryTokenAddress;
  }
  const targetFoundryTokenContract = new ethers.Contract(
    response.targetFoundryTokenAddress,
    tokenAbi.abi,
    targetNetwork.provider
  );
  const targetTokenDecimal = await targetTokenContract.decimals();
  const targetFoundryTokenDecimal = await targetFoundryTokenContract.decimals();
  let targetTypeResponse = await getTargetAssetTypes(
    targetNetwork,
    await common.getWrappedNativeTokenAddress(targetTokenAddress, targetChainId)
  );
  const isTargetTokenFoundry = targetTypeResponse.isFoundryAsset;
  if (isTargetTokenFoundry) {
    response.targetAssetType = utils.assetType.FOUNDARY;
  } else {
    response.targetAssetType = utils.assetType.ONE_INCH;
  }
  if (isTargetTokenFoundry === true) {
    sourceAmountInNumber = getSourceAmountOut(
      gasEstimationDestinationAmount,
      sourceAmountInNumber
    );
    response.destinationAmountOutInNumber = sourceAmountInNumber;
    response.minDestinationAmountOut = sourceAmountInNumber;
    response.destinationAmountOutInNumber = getAmountWithoutSourceSlippage(
      response.destinationAmountOutInNumber,
      sourceSlippageInNumber
    );
    response.usdcAmount = response.destinationAmountOutInNumber;
    response.destinationAmountIn = common.numberIntoDecimals__(
      sourceAmountInNumber,
      targetFoundryTokenDecimal
    );
  } else {
    sourceAmountInNumber = getSourceAmountOut(
      gasEstimationDestinationAmount,
      sourceAmountInNumber
    );
    let machineAmount: any = common.numberIntoDecimals__(
      sourceAmountInNumber,
      targetFoundryTokenDecimal
    );
    response.destinationAmountIn = machineAmount;
    machineAmount = utils.convertFromExponentialToDecimal(machineAmount);
    if (machineAmount <= 0) {
      throw swapIsNotAvailable;
    }
    let providerResponse: any = await chooseProviderAndGetData(
      sourceWalletAddress,
      targetChainId,
      targetNetwork?.foundryTokenAddress,
      await common.getNativeTokenAddress(targetTokenAddress),
      machineAmount,
      destinationSlippage,
      targetNetwork?.fiberRouter,
      destinationWalletAddress,
      false
    );
    response.destinationCallData = providerResponse.callData;
    response.destinationAmountOut = providerResponse.amounts;
    response.destinationAmountOutInNumber = getAmountWithoutSourceSlippage_(
      machineAmount,
      response.destinationAmountOut,
      sourceSlippageInNumber,
      targetFoundryTokenDecimal,
      targetTokenDecimal
    );
    response.usdcAmount = getAmountWithoutSourceSlippage(
      common.decimalsIntoNumber(machineAmount, targetFoundryTokenDecimal),
      sourceSlippageInNumber
    );
    response.destinationAmountOut = await (
      global as any
    ).commonFunctions.addSlippageInDecimal(
      response.destinationAmountOut,
      destinationSlippage
    );
    response.minDestinationAmountOut = (
      global as any
    ).commonFunctions.decimalsIntoNumber(
      response.destinationAmountOut,
      targetTokenDecimal
    );
  }
  let protocolType = await checkForCCTPAndStargate(
    targetNetwork.foundryTokenAddress,
    targetNetwork.fundManager,
    targetNetwork.provider,
    utils.convertFromExponentialToDecimal(response.destinationAmountIn),
    targetFoundryTokenDecimal,
    sourceChainId,
    targetChainId,
    sourceAssetType,
    response.targetAssetType
  );
  response.isStargate = protocolType.isStargate;
  response.isCCTP = protocolType.isCCTP;
  console.log("machineDestinationAmountIn", response.destinationAmountIn);
  console.log("machineDestinationAmountOut", response.destinationAmountOut);

  return response;
};

const getSlippageInNumber = (
  totalAmount: string,
  amountToBeCut: string,
  decimals: any
) => {
  const common = (global as any).commonFunctions;
  const diff = Big(totalAmount).minus(Big(amountToBeCut));
  console.log(
    "totalAmount",
    totalAmount,
    "amountToBeCut",
    amountToBeCut,
    "diff",
    diff.toString()
  );
  return common.decimalsIntoNumber(diff, decimals);
};

const getAmountWithoutSourceSlippage = (
  destinationAmount: any,
  sourceSlippageInNumber: any
) => {
  console.log(
    "destinationAmount",
    destinationAmount,
    "sourceSlippageInNumber",
    sourceSlippageInNumber
  );
  let finalAmount = Big(destinationAmount).add(Big(sourceSlippageInNumber));
  console.log("finalAmount", finalAmount.toString());
  return finalAmount?.toString();
};

const getAmountWithoutSourceSlippage_ = (
  desAmountIn: any,
  desAmountOut: any,
  sourceSlippageInNumber: any,
  desFoundryTokenDecimal: any,
  desTokenDecimal: any
) => {
  const common = (global as any).commonFunctions;
  let destinationAmount = common.decimalsIntoNumber(
    desAmountOut,
    desTokenDecimal
  );
  let perUSDC = Big(desAmountOut).div(Big(desAmountIn));
  console.log("per usdc token is:", perUSDC.toString());
  let sourceSlippageInDecimal: any = common.numberIntoDecimals__(
    sourceSlippageInNumber,
    desFoundryTokenDecimal
  );
  console.log("sourceSlippageInDecimal:", sourceSlippageInDecimal);
  let amountToAdd: any = perUSDC.mul(Big(sourceSlippageInDecimal)).toString();
  if (amountToAdd.includes(".")) {
    amountToAdd = amountToAdd.split(".")[0];
  }
  amountToAdd = common.decimalsIntoNumber(amountToAdd, desTokenDecimal);
  console.log(
    "destinationAmount",
    destinationAmount,
    "amountToAdd:",
    amountToAdd
  );
  let finalAmount = Big(destinationAmount).add(Big(amountToAdd));
  console.log("finalAmount", finalAmount.toString());
  return finalAmount.toString();
};

const getPlatformFeeInNumber = (fee: any, decimals: any) => {
  const common = (global as any).commonFunctions;
  if (fee) {
    fee = common.decimalsIntoNumber(fee, decimals);
  }
  return fee;
};
