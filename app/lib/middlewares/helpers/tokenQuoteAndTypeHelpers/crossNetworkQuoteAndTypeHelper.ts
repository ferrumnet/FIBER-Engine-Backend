var tokenAbi = require("../../../../../artifacts/contracts/token/Token.sol/Token.json");
var { ethers } = require("ethers");
var { Big } = require("big.js");
import {
  getSourceAssetTypes,
  getTargetAssetTypes,
} from "../tokenQuoteAndTypeHelpers/assetTypeHelper";
import { checkForCCTP } from "../liquidityHelper";
import { swapIsNotAvailable } from "../stringHelper";
import { getSourceAmountOut } from "../fiberNodeHelper";
import { chooseProviderAndGetData } from "../tokenQuoteAndTypeHelpers/quoteProvidersHelper";
import {
  getDataAfterCutDistributionFee,
  getFeeDistributionObject,
} from "../feeDistribution/feeDistributionHelper";
import {
  DestinationCrossNetowrObject,
  SourceCrossNetowrObject,
} from "../../../../interfaces/quoteAndTypeInterface";

export const getQouteAndTypeForCrossNetworks = async (
  sourceChainId: any,
  sourceTokenAddress: any,
  targetChainId: any,
  targetTokenAddress: any,
  inputAmount: any,
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
  let feeDistribution: any;
  let targetFoundryTokenAddress;
  let isCCTP = false;

  let sResponse: SourceCrossNetowrObject = await handleSource(
    sourceChainId,
    sourceTokenAddress,
    inputAmount,
    gasEstimationDestinationAmount,
    sourceSlippage,
    referralCode,
    sourceNetwork
  );
  sourceAssetType = sResponse?.sourceAssetType;
  feeDistribution = sResponse?.feeDistribution;
  sourceBridgeAmount = sResponse?.sourceAmountInNumber;
  machineSourceAmountIn = sResponse?.sourceAmountIn;
  machineSourceAmountOut = sResponse?.sourceAmountOut;
  sourceCallData = sResponse?.sourceCallData;

  let dResponse: DestinationCrossNetowrObject = await handleDestination(
    sourceChainId,
    targetChainId,
    targetTokenAddress,
    destinationWalletAddress,
    gasEstimationDestinationAmount,
    destinationSlippage,
    targetNetwork,
    sResponse.sourceAmountInNumber,
    sResponse.sourceSlippageInNumber
  );
  targetAssetType = dResponse?.targetAssetType;
  destinationCallData = dResponse?.destinationCallData;
  destinationAmountOut = dResponse?.destinationAmountOutInNumber;
  minDestinationAmountOut = dResponse?.minDestinationAmountOut;
  machineDestinationAmountIn = dResponse?.destinationAmountIn;
  machineDestinationAmountOut = dResponse?.destinationAmountOut;
  targetFoundryTokenAddress = dResponse?.targetFoundryTokenAddress;
  isCCTP = dResponse?.isCCTP;

  let data: any = { source: {}, destination: {}, isCCTP: isCCTP };
  data.source.type = sourceAssetType;
  data.source.amount = inputAmount;
  data.source.sourceAmountIn = machineSourceAmountIn;
  if (machineSourceAmountOut) {
    data.source.sourceAmountOut = machineSourceAmountOut;
  }
  data.source.callData = sourceCallData;

  machineDestinationAmountOut = machineDestinationAmountOut
    ? machineDestinationAmountOut
    : machineDestinationAmountIn;
  data.destination.type = targetAssetType;
  data.destination.amount = destinationAmountOut;
  data.destination.minAmount = minDestinationAmountOut;
  data.destination.destinationAmountIn = machineDestinationAmountIn;
  data.destination.destinationAmountOut = machineDestinationAmountOut;
  data.destination.callData = destinationCallData;
  if (!gasEstimationDestinationAmount) {
    data.feeDistribution = await getFeeDistributionObject(
      feeDistribution,
      sourceNetwork,
      machineSourceAmountIn,
      machineSourceAmountOut,
      machineDestinationAmountIn,
      machineDestinationAmountOut
    );
  }
  return data;
};

const handleSource = async (
  sourceChainId: any,
  sourceTokenAddress: any,
  inputAmount: any,
  gasEstimationDestinationAmount: string,
  sourceSlippage: string,
  referralCode: string,
  sourceNetwork: any
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
    const { amountAfterCut, data } = await getDataAfterCutDistributionFee(
      referralCode,
      response.sourceAmountOut
    );
    response.sourceAmountOut = amountAfterCut;
    response.feeDistribution = data;
    response.sourceAmountInNumber = common.decimalsIntoNumber(
      response.sourceAmountOut,
      sourceFoundryTokenDecimal
    );
  } else {
    response.sourceAssetType = utils.assetType.ONE_INCH;
    let responseProvider: any = await chooseProviderAndGetData(
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
    const { amountAfterCut, data } = await getDataAfterCutDistributionFee(
      referralCode,
      response.sourceAmountOut
    );
    response.sourceAmountOut = amountAfterCut;
    response.feeDistribution = data;
    response.sourceAmountInNumber = common.decimalsIntoNumber(
      response.sourceAmountOut,
      sourceFoundryTokenDecimal
    );
  }
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
  sourceSlippageInNumber: any
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
  let amountIn: any = common.numberIntoDecimals__(
    getSourceAmountOut(gasEstimationDestinationAmount, sourceAmountInNumber),
    targetFoundryTokenDecimal
  );
  let targetTypeResponse = await getTargetAssetTypes(
    targetNetwork,
    await common.getWrappedNativeTokenAddress(
      targetTokenAddress,
      targetChainId
    ),
    amountIn
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
    response.destinationAmountOutInNumber =
      getFoundaryAmountWithoutSourceSlippage(
        response.destinationAmountOutInNumber,
        sourceSlippageInNumber
      );
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
    response.destinationAmountOutInNumber =
      getInchDesAmountWithoutSourceSlippage(
        machineAmount,
        response.destinationAmountOut,
        sourceSlippageInNumber,
        targetFoundryTokenDecimal,
        targetTokenDecimal
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
  response.isCCTP = await checkForCCTP(
    targetNetwork.foundryTokenAddress,
    targetNetwork.fundManager,
    targetNetwork.provider,
    utils.convertFromExponentialToDecimal(response.destinationAmountIn),
    targetFoundryTokenDecimal,
    sourceChainId,
    targetChainId
  );
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

const getInchDesAmountWithoutSourceSlippage = (
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

const getFoundaryAmountWithoutSourceSlippage = (
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
