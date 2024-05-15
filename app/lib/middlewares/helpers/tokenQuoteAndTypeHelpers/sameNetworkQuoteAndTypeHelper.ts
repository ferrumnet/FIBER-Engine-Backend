var { ethers } = require("ethers");
var tokenAbi = require("../../../../../artifacts/contracts/token/Token.sol/Token.json");
import { getSourceAssetTypes, getTargetAssetTypes } from "./assetTypeHelper";
import { chooseProviderAndGetData } from "./quoteProvidersHelper";
import { DEFAULT_SLIPPAGE } from "../configurationHelper";
import { getSourceAmountOut } from "../fiberNodeHelper";

let common = (global as any).commonFunctions;

export const getQouteAndTypeForSameNetworks = async (
  sourceChainId: string,
  sourceTokenAddress: string,
  destinationChainId: string,
  destinationTokenAddress: string,
  inputAmount: any,
  sourceWallet: string,
  destinationWallet: string,
  gasEstimationDestinationAmount: string,
  sourceSlippage: string,
  destinationSlippage: string
) => {
  let sourceAssetType;
  let destinationAssetType;
  let sourceAmountIn: any;
  let sourceAmountOut: any;
  let sourceResponse: any;
  let destinationResponse: any;
  let slippage = getHighestSlippage(sourceSlippage, destinationSlippage);
  const sourceNetwork = getNetworkByChainID(sourceChainId);
  const destinationNetwork = sourceNetwork;
  const sourceTokenDecimals = await getDecimals(
    sourceTokenAddress,
    sourceChainId,
    sourceNetwork.provider
  );
  const destinationTokenDecimals = await getDecimals(
    destinationTokenAddress,
    destinationChainId,
    destinationNetwork.provider
  );
  sourceResponse = await handleSource(
    sourceChainId,
    sourceTokenAddress,
    destinationChainId,
    destinationTokenAddress,
    inputAmount,
    sourceWallet,
    destinationWallet,
    slippage,
    sourceNetwork,
    sourceTokenDecimals,
    destinationTokenDecimals
  );
  destinationResponse = await handleDestination(
    sourceChainId,
    sourceTokenAddress,
    destinationChainId,
    destinationTokenAddress,
    inputAmount,
    sourceWallet,
    destinationWallet,
    slippage,
    destinationNetwork,
    sourceTokenDecimals,
    destinationTokenDecimals,
    sourceResponse?.amountOutIntoNumber,
    gasEstimationDestinationAmount
  );

  return convertResponseForSameNetworksIntoDesire(
    sourceResponse,
    destinationResponse
  );
};

const handleSource = async (
  sourceChainId: string,
  sourceTokenAddress: string,
  destinationChainId: string,
  destinationTokenAddress: string,
  inputAmount: any,
  sourceWallet: string,
  destinationWallet: string,
  slippage: string,
  sourceNetwork: any,
  sourceTokenDecimals: any,
  destinationTokenDecimals: any
) => {
  let assetType;
  let sourceAmountIn: any;
  let response: any = {};

  let inputAmountIntoDecimals = common.numberIntoDecimals(
    inputAmount,
    sourceTokenDecimals
  );
  assetType = await getTokenType(
    sourceNetwork,
    sourceTokenAddress,
    sourceChainId,
    inputAmountIntoDecimals
  );
  let amountOutIntoDecimals = await common.numberIntoDecimals(
    inputAmount,
    sourceTokenDecimals
  );
  response.sourceAssetType = assetType;
  response.amountOutIntoDecimals = amountOutIntoDecimals;
  response.amountOutIntoNumber = inputAmount;
  response.inputAmount = inputAmount;
  return response;
};

const handleDestination = async (
  sourceChainId: string,
  sourceTokenAddress: string,
  destinationChainId: string,
  destinationTokenAddress: string,
  inputAmount: any,
  sourceWallet: string,
  destinationWallet: string,
  slippage: string,
  destinationNetwork: any,
  sourceTokenDecimals: any,
  destinationTokenDecimals: any,
  sourceAmountOutIntoNumber: any,
  gasEstimationDestinationAmount: string
) => {
  let assetType;
  let response: any;

  let inputAmountIntoDecimals = common.numberIntoDecimals(
    inputAmount,
    sourceTokenDecimals
  );
  let amountIn: any = common.numberIntoDecimals__(
    getSourceAmountOut(
      gasEstimationDestinationAmount,
      sourceAmountOutIntoNumber
    ),
    sourceTokenDecimals
  );
  assetType = await getTokenType(
    destinationNetwork,
    destinationTokenAddress,
    destinationChainId,
    amountIn
  );
  response = await chooseProviderAndGetData(
    sourceChainId,
    await common.getWrappedNativeTokenAddress(
      sourceTokenAddress,
      sourceChainId
    ),
    await common.getNativeTokenAddress(destinationTokenAddress),
    inputAmountIntoDecimals,
    slippage,
    sourceWallet,
    destinationWallet
  );
  response.amountOutIntoNumber = common.decimalsIntoNumber(
    response.amounts,
    destinationTokenDecimals
  );
  response.amountOutIntoDecimals = await common.addSlippageInDecimal(
    response.amounts,
    slippage
  );
  response.minAmountOutIntoNumber = common.decimalsIntoNumber(
    response.amounts,
    destinationTokenDecimals
  );
  response.amountInIntoDecimals = inputAmountIntoDecimals;
  response.destinationAssetType = assetType;
  response.inputAmount = inputAmount;
  return response;
};

const handleFoundary = async (inputAmount: any, tokenDecimals: any) => {
  let amountOutIntoDecimals = await common.numberIntoDecimals(
    inputAmount,
    tokenDecimals
  );
  return {
    amountOutIntoNumber: inputAmount,
    amountOutIntoDecimals: amountOutIntoDecimals,
  };
};

const getNetworkByChainID = (chainId: string) => {
  return (global as any).commonFunctions.getNetworkByChainId(chainId)
    .multiswapNetworkFIBERInformation;
};

const getDecimals = async (
  tokenAddress: string,
  chainId: string,
  provider: any
) => {
  const tokenContract = new ethers.Contract(
    await common.getWrappedNativeTokenAddress(tokenAddress, chainId),
    tokenAbi.abi,
    provider
  );
  return await tokenContract.decimals();
};

const getTokenType = async (
  network: any,
  sourceTokenAddress: string,
  chainId: string,
  amountIntoDecimal: any
): Promise<string> => {
  let assetType;
  let type = await getSourceAssetTypes(
    network,
    await (global as any).commonFunctions.getWrappedNativeTokenAddress(
      sourceTokenAddress,
      chainId
    ),
    amountIntoDecimal
  );
  const isFoundry = type.isFoundryAsset;
  if (isFoundry) {
    assetType = (global as any).utils.assetType.FOUNDARY;
  } else {
    assetType = (global as any).utils.assetType.ONE_INCH;
  }
  return assetType;
};

const convertResponseForSameNetworksIntoDesire = (
  sData: any,
  dData: any
): string => {
  let response: any = { source: {}, destination: {} };
  response.source.type = sData.sourceAssetType;
  response.source.amount = sData.inputAmount;
  if (sData.amountOutIntoDecimals) {
    response.source.sourceAmountOut = sData.amountOutIntoDecimals;
  }
  response.source.callData = sData?.oneInchData;

  response.destination.type = dData.destinationAssetType;
  response.destination.amount = dData.amountOutIntoNumber;
  response.destination.minAmount = dData.minAmountOutIntoNumber;
  response.destination.destinationAmountIn = dData.amountInIntoDecimals;
  response.destination.destinationAmountOut = dData.amountOutIntoDecimals;
  response.destination.callData = dData?.callData;

  return response;
};

const getHighestSlippage = (sSlippage: string, dSlippage: any) => {
  if (sSlippage && dSlippage) {
    if (Number(sSlippage) > Number(dSlippage)) {
      return sSlippage;
    } else {
      return dSlippage;
    }
  } else {
    return DEFAULT_SLIPPAGE;
  }
};
