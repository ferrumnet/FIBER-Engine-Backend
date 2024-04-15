var { ethers } = require("ethers");
var tokenAbi = require("../../../../../artifacts/contracts/token/Token.sol/Token.json");
import {
  getSourceAssetTypes,
  getTargetAssetTypes,
} from "../../helpers/tokenQuoteAndTypeHelpers/assetTypeHelper";
import { OneInchSwap } from "../../../httpCalls/oneInchAxiosHelper";
import { isValidOneInchSelector } from "../../helpers/configurationHelper";
import {
  removeSelector,
  getSelector,
} from "../../helpers/oneInchDecoderHelper";
import { swapIsNotAvailable } from "../../helpers/stringHelper";
import { getSourceAmountOut } from "../../helpers/fiberNodeHelper";

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
  console.log("destinationResponse", destinationResponse);

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
  // if (assetType == (global as any).utils.assetType.FOUNDARY) {
  //   response = await handleFoundary(inputAmount, sourceTokenDecimals);
  // } else {
  //   response = await handleOneInche(
  //     sourceChainId,
  //     destinationChainId,
  //     sourceTokenAddress,
  //     destinationTokenAddress,
  //     inputAmountIntoDecimals,
  //     slippage,
  //     destinationTokenDecimals,
  //     sourceWallet,
  //     destinationWallet
  //   );
  // }
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
    destinationTokenDecimals
  );

  let amountIn: any = common.numberIntoDecimals__(
    getSourceAmountOut(
      gasEstimationDestinationAmount,
      sourceAmountOutIntoNumber
    ),
    destinationTokenDecimals
  );
  assetType = await getTokenType(
    destinationNetwork,
    destinationTokenAddress,
    destinationChainId,
    amountIn
  );

  // if (assetType == (global as any).utils.assetType.FOUNDARY) {
  //   response = await handleFoundary(inputAmount, sourceTokenDecimals);
  // } else {
  response = await handleOneInche(
    sourceChainId,
    destinationChainId,
    sourceTokenAddress,
    destinationTokenAddress,
    inputAmountIntoDecimals,
    slippage,
    destinationTokenDecimals,
    sourceWallet,
    destinationWallet
  );
  // }
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

const handleOneInche = async (
  sourceChainId: string,
  destinationChainId: string,
  sourceTokenAddress: string,
  destinationTokenAddress: string,
  inputAmountIntoDecimals: any,
  sourceSlippage: string,
  destinationTokenDecimals: any,
  sourceWallet: string,
  destinationeWallet: string
) => {
  let amountOutIntoDecimals;
  let amountOutIntoNumber;
  let minAmountOutIntoNumber;
  let oneInchData;

  let response = await OneInchSwap(
    sourceChainId,
    await common.getWrappedNativeTokenAddress(
      sourceTokenAddress,
      sourceChainId
    ),
    await common.getWrappedNativeTokenAddress(
      destinationTokenAddress,
      destinationChainId
    ),
    inputAmountIntoDecimals,
    sourceWallet,
    destinationeWallet,
    sourceSlippage
  );
  if (response?.responseMessage) {
    throw response?.responseMessage;
  }
  if (response && response.amounts && response.data) {
    amountOutIntoNumber = common.decimalsIntoNumber(
      response.amounts,
      destinationTokenDecimals
    );
    amountOutIntoDecimals = await common.addSlippageInDecimal(
      response.amounts,
      sourceSlippage
    );
    minAmountOutIntoNumber = common.decimalsIntoNumber(
      response.amounts,
      destinationTokenDecimals
    );
    oneInchData = response.data;
  }
  if (
    oneInchData &&
    !(await isValidOneInchSelector(getSelector(oneInchData)))
  ) {
    throw swapIsNotAvailable;
  }
  return {
    amountInIntoDecimals: inputAmountIntoDecimals,
    amountOutIntoDecimals: amountOutIntoDecimals,
    amountOutIntoNumber: amountOutIntoNumber,
    minAmountOutIntoNumber: minAmountOutIntoNumber,
    oneInchData: oneInchData,
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
    response.source.bridgeAmount = sData.amountOutIntoDecimals;
  }
  response.source.oneInchData = sData?.oneInchData;

  response.destination.type = dData.destinationAssetType;
  response.destination.amount = dData.amountOutIntoNumber;
  response.destination.minAmount = dData.minAmountOutIntoNumber;
  response.destination.bridgeAmountIn = dData.amountInIntoDecimals;
  response.destination.bridgeAmountOut = dData.amountOutIntoDecimals;
  response.destination.oneInchData = dData?.oneInchData;

  console.log("response", response);
  return response;
};

const getHighestSlippage = (sSlippage: string, dSlippage: any) => {
  if (Number(sSlippage) > Number(dSlippage)) {
    return sSlippage;
  } else {
    return dSlippage;
  }
};
