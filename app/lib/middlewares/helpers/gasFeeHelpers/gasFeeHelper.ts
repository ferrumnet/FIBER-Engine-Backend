import Web3 from "web3";
import moment from "moment";
var crypto = require("crypto");
const { ethers } = require("ethers");
const { Big } = require("big.js");

import {
  createSignedPayment,
  recoverAddress,
} from "../forgeHelpers/forgeSignatureHelper";
import {
  destinationFoundaryGasEstimation,
  destinationOneInchGasEstimation,
  sourceFoundaryGasEstimation,
  sourceOneInchGasEstimation,
  sourceSameNetworkGasEstimation,
} from "../forgeHelpers/forgeContractHelper";
import {
  Contract,
  WithdrawSigned,
  WithdrawSignedAndSwapOneInch,
} from "../../../../interfaces/forgeInterface";
import { getQuote } from "../../../httpCalls/coinMarketCapAxiosHelper";
import {
  addBuffer_,
  getGasPrice,
  isAllowedAggressivePriceForDynamicGasEstimation,
  getCCTPGasPrice,
} from "./gasEstimationHelper";
import {
  Swap,
  SwapOneInch,
  SwapSameNetwork,
} from "../../../../interfaces/forgeInterface";
import { getWithdrawalDataHashForSwap } from "../signatureHelper";
import { getValueForSwap } from "../fiberEngineHelper";
import { getIsCCTP, getForgeFundManager } from "../cctpHelpers/cctpHelper";
import { getIsStargate } from "../stargateHelpers/stargateHelper";
import { isSameNetworksSwap } from "../multiSwapHelper";

export const gasEstimationValidation = (req: any): any => {
  if (
    !req.query.destinationNetworkChainId ||
    !req.query.destinationWalletAddress ||
    !req.query.destinationTokenContractAddress ||
    !req.query.destinationAmountIn ||
    !req.query.destinationAssetType ||
    !req.query.sourceNetworkChainId ||
    !req.query.sourceTokenContractAddress ||
    !req.query.sourceAssetType
  ) {
    throw (
      "destinationNetworkChainId & destinationWalletAddress & destinationTokenContractAddress &" +
      "destinationAmountIn & destinationAssetType & sourceNetworkChainId & sourceTokenContractAddress & sourceAssetType  are missing"
    );
  }
  const isSameNetworkSwap = isSameNetworksSwap(
    req.query.sourceNetworkChainId,
    req.query.destinationNetworkChainId
  );
  if (!isSameNetworkSwap && !req.body.feeDistribution) {
    throw "feeDistribution is missing";
  }
  if (!isSameNetworkSwap && !req.body.originalDestinationAmountIn) {
    throw "originalDestinationAmountIn is missing";
  }

  if (!isSameNetworkSwap && !req.body.originalDestinationAmountOut) {
    throw "originalDestinationAmountOut is missing";
  }
};

export const sourceGasEstimation = async (
  req: any,
  destinationGasPrice: string,
  isSameNetworks: boolean
): Promise<any> => {
  const FOUNDARY = (global as any).utils.assetType.FOUNDARY;
  const ONE_INCH = (global as any).utils.assetType.ONE_INCH;
  let gasPrice;
  const SOURCE_NETWORK = (global as any).commonFunctions.getNetworkByChainId(
    req.query.sourceNetworkChainId
  ).multiswapNetworkFIBERInformation;

  let contractObj: Contract = {
    rpcUrl: SOURCE_NETWORK.rpcUrl,
    contractAddress: SOURCE_NETWORK.fiberRouter,
  };

  if (isSameNetworks) {
    gasPrice = await doSameNetworkGasEstimation(
      contractObj,
      SOURCE_NETWORK,
      req,
      SOURCE_NETWORK.provider,
      destinationGasPrice,
      SOURCE_NETWORK.foundryTokenAddress
    );
  } else if (req.query.sourceAssetType == FOUNDARY) {
    gasPrice = await doSourceFoundaryGasEstimation(
      contractObj,
      SOURCE_NETWORK,
      req,
      SOURCE_NETWORK.provider,
      destinationGasPrice
    );
  } else {
    gasPrice = await doSourceOneInchGasEstimation(
      contractObj,
      SOURCE_NETWORK,
      req,
      SOURCE_NETWORK.provider,
      destinationGasPrice,
      SOURCE_NETWORK.foundryTokenAddress
    );
  }
  console.log("source gas limit", gasPrice?.toString());
  let gasPrices = await getSourceGasPrices(
    req.query.sourceNetworkChainId,
    SOURCE_NETWORK.rpcUrl,
    gasPrice,
    SOURCE_NETWORK.provider
  );
  return gasPrices;
};

export const destinationGasEstimation = async (req: any): Promise<any> => {
  const SALT = Web3.utils.keccak256(crypto.randomBytes(512).toString("hex"));
  const EXPIRY = getExpiry();
  const FOUNDARY = (global as any).utils.assetType.FOUNDARY;
  const ONE_INCH = (global as any).utils.assetType.ONE_INCH;
  let gasPrice;
  const TARGET_NETWORK = (global as any).commonFunctions.getNetworkByChainId(
    req.query.destinationNetworkChainId
  ).multiswapNetworkFIBERInformation;

  const SOURCE_NETWORK = (global as any).commonFunctions.getNetworkByChainId(
    req.query.sourceNetworkChainId
  ).multiswapNetworkFIBERInformation;

  const SIGNATURE: any = await getForgeSignature(
    req,
    SALT,
    EXPIRY,
    TARGET_NETWORK
  );
  let contractObj: Contract = {
    rpcUrl: TARGET_NETWORK.rpcUrl,
    contractAddress: TARGET_NETWORK.forgeContractAddress,
  };

  if (req.query.destinationAssetType == FOUNDARY) {
    gasPrice = await doDestinationFoundaryGasEstimation(
      contractObj,
      SOURCE_NETWORK,
      TARGET_NETWORK,
      req,
      SALT,
      EXPIRY,
      SIGNATURE.signature
    );
  } else {
    gasPrice = await doDestinationOneInchGasEstimation(
      contractObj,
      TARGET_NETWORK,
      req,
      SALT,
      EXPIRY,
      SIGNATURE.signature,
      TARGET_NETWORK
    );
  }
  let isStargate = getIsStargate(req.query.isStargate);
  let destinationGasPrices;
  console.log("destination gas limit", gasPrice.toString());
  if (!isStargate) {
    destinationGasPrices = await getDestinationGasPrices(
      req.query.destinationNetworkChainId,
      TARGET_NETWORK.rpcUrl,
      gasPrice,
      TARGET_NETWORK.provider,
      getIsCCTP(req.query.isCCTP)
    );
    gasPrice = destinationGasPrices?.gasPriceInUSD;
  }

  let gasPrices: any = await convertIntoSourceGasPrices(
    req.query.sourceNetworkChainId,
    SOURCE_NETWORK.rpcUrl,
    gasPrice,
    SOURCE_NETWORK.provider,
    isStargate
  );
  gasPrices.gasLimit = destinationGasPrices?.gasLimit;
  return gasPrices;
};

export const doDestinationFoundaryGasEstimation = async (
  contract: Contract,
  srcNetwork: any,
  desNetwork: any,
  req: any,
  salt: string,
  expiry: number,
  signature: string
): Promise<any> => {
  let amount = await getSourceAmount(
    req.query.sourceAmount,
    await (global as any).commonFunctions.getWrappedNativeTokenAddress(
      req.query.sourceTokenContractAddress,
      req.query.sourceNetworkChainId
    ),
    srcNetwork.provider
  );
  let obj: WithdrawSigned = {
    targetTokenAddress: await (
      global as any
    ).commonFunctions.getNativeTokenAddress(
      req.query.destinationTokenContractAddress
    ),
    destinationWalletAddress: req.query.destinationWalletAddress,
    sourceAmountIn: amount,
    destinationAmountIn: req.query.destinationAmountIn,
    salt: salt,
    signatureExpiry: expiry,
    signature: signature,
    isCCTP: getIsCCTP(req.query.isCCTP),
    isStargate: getIsStargate(req.query.isStargate),
  };
  return await destinationFoundaryGasEstimation(
    contract,
    srcNetwork,
    desNetwork,
    obj
  );
};

export const doDestinationOneInchGasEstimation = async (
  contractObj: Contract,
  network: any,
  req: any,
  salt: string,
  expiry: number,
  signature: string,
  targetNetwork: any
): Promise<any> => {
  let obj: WithdrawSignedAndSwapOneInch = {
    targetTokenAddress: await (
      global as any
    ).commonFunctions.getNativeTokenAddress(
      req.query.destinationTokenContractAddress
    ),
    destinationWalletAddress: req.query.destinationWalletAddress,
    destinationAmountIn: req.query.destinationAmountIn,
    salt: salt,
    signatureExpiry: expiry,
    signature: signature,
    destinationAmountOut: req.query.destinationAmountOut,
    targetFoundryTokenAddress: targetNetwork.foundryTokenAddress,
    destinationOneInchData: req.query.destinationOneInchData,
    oneInchSelector: req.query.destinationOneInchSelector,
    aggregateRouterContractAddress:
      targetNetwork.aggregateRouterContractAddress,
    isCCTP: getIsCCTP(req.query.isCCTP),
  };
  return await destinationOneInchGasEstimation(contractObj, network, obj);
};

export const doSourceFoundaryGasEstimation = async (
  contractObj: Contract,
  srcNetwork: any,
  req: any,
  provider: any,
  gasPrice: string
): Promise<any> => {
  let feeDistribution = req?.body?.feeDistribution;
  let amount = await getSourceAmount(
    req.query.sourceAmount,
    await (global as any).commonFunctions.getWrappedNativeTokenAddress(
      req.query.sourceTokenContractAddress,
      req.query.sourceNetworkChainId
    ),
    provider
  );
  let obj: Swap = {
    sourceTokenAddress: req.query.sourceTokenContractAddress,
    amount: amount,
    targetChainId: req.query.destinationNetworkChainId,
    targetTokenAddress: await (
      global as any
    ).commonFunctions.getNativeTokenAddress(
      req.query.destinationTokenContractAddress
    ),
    destinationWalletAddress: req.query.destinationWalletAddress,
    withdrawalData: getWithdrawalDataHashForSwap(
      req.query?.sourceOneInchData,
      req.query?.destinationOneInchData,
      req.query?.destinationAmountIn,
      req.query?.destinationAmountOut,
      req.query?.sourceAssetType,
      req.query?.destinationAssetType
    ),
    sourceWalletAddress: req.query.sourceWalletAddress,
    value: getValueForSwap(
      amount,
      gasPrice,
      await (global as any).commonFunctions.isNativeToken(
        req.query.sourceTokenContractAddress
      )
    ),
    isCCTP: getIsCCTP(req.query.isCCTP),
    feeDistribution: feeDistribution,
    isStargate: getIsStargate(req.query.isStargate),
  };
  return await sourceFoundaryGasEstimation(contractObj, srcNetwork, obj);
};

export const doSourceOneInchGasEstimation = async (
  contractObj: Contract,
  network: any,
  req: any,
  provider: any,
  gasPrice: string,
  foundryTokenAddress: string
): Promise<any> => {
  let feeDistribution = req?.body?.feeDistribution;
  let amount = await getSourceAmount(
    req.query.sourceAmount,
    await (global as any).commonFunctions.getWrappedNativeTokenAddress(
      req.query.sourceTokenContractAddress,
      req.query.sourceNetworkChainId
    ),
    provider
  );
  let obj: SwapOneInch = {
    amountIn: amount,
    amountOut: req.query.sourceAmountOut,
    targetChainId: req.query.destinationNetworkChainId,
    targetTokenAddress: await (
      global as any
    ).commonFunctions.getNativeTokenAddress(
      req.query.destinationTokenContractAddress
    ),
    destinationWalletAddress: req.query.destinationWalletAddress,
    sourceOneInchData: req.query.sourceOneInchData,
    sourceTokenAddress: req.query.sourceTokenContractAddress,
    foundryTokenAddress: foundryTokenAddress,
    withdrawalData: getWithdrawalDataHashForSwap(
      req.query?.sourceOneInchData,
      req.query?.destinationOneInchData,
      req.query?.destinationAmountIn,
      req.query?.destinationAmountOut,
      req.query?.sourceAssetType,
      req.query?.destinationAssetType
    ),
    sourceWalletAddress: req.query.sourceWalletAddress,
    gasPrice: gasPrice,
    value: getValueForSwap(
      amount,
      gasPrice,
      await (global as any).commonFunctions.isNativeToken(
        req.query.sourceTokenContractAddress
      )
    ),
    oneInchSelector: req.query.sourceOneInchSelector,
    aggregateRouterContractAddress: network.aggregateRouterContractAddress,
    isCCTP: getIsCCTP(req.query.isCCTP),
    feeDistribution: feeDistribution,
  };
  return await sourceOneInchGasEstimation(contractObj, network, obj);
};

export const doSameNetworkGasEstimation = async (
  contractObj: Contract,
  network: any,
  req: any,
  provider: any,
  gasPrice: string,
  foundryTokenAddress: string
): Promise<any> => {
  let amount = await getSourceAmount(
    req.query.sourceAmount,
    await (global as any).commonFunctions.getWrappedNativeTokenAddress(
      req.query.sourceTokenContractAddress,
      req.query.sourceNetworkChainId
    ),
    provider
  );
  let obj: SwapSameNetwork = {
    amountIn: req.query.destinationAmountIn,
    amountOut: req.query.destinationAmountOut,
    targetTokenAddress: await (
      global as any
    ).commonFunctions.getNativeTokenAddress(
      req.query.destinationTokenContractAddress
    ),
    destinationWalletAddress: req.query.destinationWalletAddress,
    destinationOneInchData: req.query.destinationOneInchData,
    sourceTokenAddress: req.query.sourceTokenContractAddress,
    sourceWalletAddress: req.query.sourceWalletAddress,
    value: getValueForSwap(
      amount,
      gasPrice,
      await (global as any).commonFunctions.isNativeToken(
        req.query.sourceTokenContractAddress
      ),
      true
    ),
    oneInchSelector: req.query.destinationOneInchSelector,
    aggregateRouterContractAddress: network.aggregateRouterContractAddress,
  };
  return await sourceSameNetworkGasEstimation(contractObj, network, obj);
};

export const getForgeSignature = async (
  req: any,
  salt: string,
  expiry: number,
  targetNetwork: any
): Promise<any> => {
  const web3 = new Web3(targetNetwork.rpcUrl);
  const SIGNATURE = createSignedPayment(
    req.query.destinationNetworkChainId,
    req.query.destinationWalletAddress, // need to check
    req.query.destinationAmountIn,
    await (global as any).commonFunctions.getNativeTokenAddress(
      req.query.destinationTokenContractAddress
    ),
    getForgeFundManager(getIsCCTP(req.query.isCCTP), targetNetwork),
    salt,
    req.query.destinationAssetType,
    req.query.destinationAmountIn,
    req.query.destinationAmountOut,
    targetNetwork.foundryTokenAddress,
    req.query.destinationOneInchData,
    expiry,
    web3,
    targetNetwork.aggregateRouterContractAddress
  );
  recoverAddress(SIGNATURE.signature, SIGNATURE.hash);
  return SIGNATURE;
};

export const getExpiry = function () {
  return moment().utc().add("days", 5).unix();
};

export const convertIntoSourceNative = async (
  destinationGasPrice: string
): Promise<any> => {};

async function getCurrentGasPrice(
  chainId: string,
  provider: any,
  isSource: boolean
) {
  try {
    let gasPrice: any;
    if (
      await isAllowedAggressivePriceForDynamicGasEstimation(chainId, isSource)
    ) {
      gasPrice = await getGasPrice(chainId);
      gasPrice = Web3.utils.toWei(gasPrice, "gwei");
    } else {
      gasPrice = await provider.getGasPrice();
    }
    console.log("CP:", gasPrice.toString(), "CI:", chainId);
    return gasPrice;
  } catch (e) {
    console.error(e);
  }
}

async function getSourceGasPrices(
  chainId: string,
  rpcUrl: string,
  gasPrice: any,
  provider: any
) {
  try {
    let currentGasPrice = await getCurrentGasPrice(chainId, provider, true);
    let gasPriceInMachine = new Big(gasPrice);
    gasPriceInMachine = gasPriceInMachine.mul(currentGasPrice);
    let nativeToken = await (global as any).commonFunctions.getTokenByChainId(
      chainId
    );
    let decimals = await (global as any).commonFunctions.decimals(
      provider,
      nativeToken?.wrappedAddress
    );
    let gasPriceInNative = (global as any).commonFunctions.decimalsIntoNumber(
      gasPriceInMachine,
      decimals
    );
    gasPriceInNative = new Big(gasPriceInNative);
    let usdPrice = await getQuote(nativeToken?.symbol);
    let gasPriceInToUSD = new Big(gasPriceInNative).mul(usdPrice);
    return {
      gasPrice: gasPriceInNative.toString(),
      gasPriceInUSD: gasPriceInToUSD.toString(),
    };
  } catch (e) {
    console.error(e);
  }
}

async function getDestinationGasPrices(
  chainId: string,
  rpcUrl: string,
  gasPrice: any,
  provider: any,
  isCCTP: boolean
) {
  try {
    let currentGasPrice = await getCurrentGasPrice(chainId, provider, false);
    let gasPriceInMachine = new Big(gasPrice).mul(currentGasPrice);
    let nativeToken = await (global as any).commonFunctions.getTokenByChainId(
      chainId
    );
    let decimals = await (global as any).commonFunctions.decimals(
      provider,
      nativeToken?.wrappedAddress
    );
    let gasPriceInNative = (global as any).commonFunctions.decimalsIntoNumber(
      gasPriceInMachine,
      decimals
    );
    gasPriceInNative = new Big(gasPriceInNative);
    gasPriceInNative = await addCCTPFee(gasPriceInNative, isCCTP, chainId);
    let usdPrice = await getQuote(nativeToken?.symbol);
    let gasPriceInToUSD = new Big(gasPriceInNative).mul(usdPrice);
    gasPriceInToUSD = await addBuffer_(gasPriceInToUSD, chainId, false);
    return {
      gasPrice: gasPriceInNative.toString(),
      gasPriceInUSD: gasPriceInToUSD.toString(),
      gasLimit: gasPrice?.toString(),
    };
  } catch (e) {
    console.error(e);
  }
}

async function convertIntoSourceGasPrices(
  chainId: string,
  rpcUrl: string,
  gasPrice: any,
  provider: any,
  isStargate: any
) {
  try {
    let gasPriceInNative;
    let nativeToken = await (global as any).commonFunctions.getTokenByChainId(
      chainId
    );
    let usdPrice = await getQuote(nativeToken?.symbol);
    let decimals = await (global as any).commonFunctions.decimals(
      provider,
      nativeToken?.wrappedAddress
    );
    if (isStargate) {
      gasPriceInNative = (global as any).commonFunctions.decimalsIntoNumber(
        gasPrice.toString(),
        decimals
      );
      gasPriceInNative = await addBuffer_(gasPriceInNative, chainId, false);
    } else {
      gasPriceInNative = new Big(gasPrice).div(usdPrice);
    }
    let gasPriceInDecimal = (
      global as any
    ).commonFunctions.numberIntoDecimals__(
      gasPriceInNative.toString(),
      decimals
    );
    let gasPriceInToUSD = new Big(gasPriceInNative).mul(usdPrice);
    return {
      gasPrice: gasPriceInNative?.toString(),
      gasPriceInUSD: gasPriceInToUSD.toString(),
      gasPriceInMachine: gasPriceInDecimal?.toString(),
    };
  } catch (e) {
    console.error(e);
  }
}

async function getSourceAmount(amount: string, address: string, provider: any) {
  try {
    let decimals = await (global as any).commonFunctions.decimals(
      provider,
      address
    );
    let amountIntoDeciaml = (
      global as any
    ).commonFunctions.numberIntoDecimals__(amount, decimals);
    return amountIntoDeciaml;
  } catch (e) {
    console.error(e);
  }
}

async function addCCTPFee(fee: any, isCCTP: boolean, chainId: string) {
  if (!isCCTP) {
    return fee;
  }
  let cctpFee = await getCCTPGasPrice(chainId);
  let sum = fee.add(Big(cctpFee));
  console.log(
    "before",
    fee?.toString(),
    "cctp",
    cctpFee?.toString(),
    "after",
    sum?.toString()
  );
  return sum;
}
