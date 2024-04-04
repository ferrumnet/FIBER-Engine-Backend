import Web3 from "web3";
import moment from "moment";
var crypto = require("crypto");
const { ethers } = require("ethers");
const { Big } = require("big.js");

import {
  createSignedPayment,
  recoverAddress,
} from "../forgeHelpers/forgeSignatureHelpers/forgeSignatureHelper";
import {
  destinationFoundaryGasEstimation,
  destinationOneInchGasEstimation,
  sourceFoundaryGasEstimation,
  sourceOneInchGasEstimation,
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
} from "./gasEstimationHelper";
import { Swap, SwapOneInch } from "../../../../interfaces/forgeInterface";
import { getWithdrawalDataHashForSwap } from "../../../../lib/middlewares/helpers/signatureHelper";
import { getValueForSwap } from "../../../../lib/middlewares/helpers/fiberEngineHelper";
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
};

export const sourceGasEstimation = async (
  req: any,
  destinationGasPrice: string
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

  if (req.query.sourceAssetType == FOUNDARY) {
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
  console.log("destination gas limit", gasPrice.toString());
  let destinationGasPrices = await getDestinationGasPrices(
    req.query.destinationNetworkChainId,
    TARGET_NETWORK.rpcUrl,
    gasPrice,
    TARGET_NETWORK.provider
  );

  let gasPrices: any = await convertIntoSourceGasPrices(
    req.query.sourceNetworkChainId,
    SOURCE_NETWORK.rpcUrl,
    destinationGasPrices?.gasPriceInUSD,
    SOURCE_NETWORK.provider
  );
  gasPrices.gasLimit = destinationGasPrices?.gasLimit;
  return gasPrices;
};

export const doDestinationFoundaryGasEstimation = async (
  contract: Contract,
  network: any,
  req: any,
  salt: string,
  expiry: number,
  signature: string
): Promise<any> => {
  let obj: WithdrawSigned = {
    targetTokenAddress: await (
      global as any
    ).commonFunctions.getOneInchTokenAddress(
      req.query.destinationTokenContractAddress
    ),
    destinationWalletAddress: req.query.destinationWalletAddress,
    destinationAmountIn: req.query.destinationAmountIn,
    salt: salt,
    signatureExpiry: expiry,
    signature: signature,
  };
  return await destinationFoundaryGasEstimation(contract, network, obj);
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
    ).commonFunctions.getOneInchTokenAddress(
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
  };
  return await destinationOneInchGasEstimation(contractObj, network, obj);
};

export const doSourceFoundaryGasEstimation = async (
  contractObj: Contract,
  network: any,
  req: any,
  provider: any,
  gasPrice: string
): Promise<any> => {
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
    ).commonFunctions.getOneInchTokenAddress(
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
  };
  return await sourceFoundaryGasEstimation(contractObj, network, obj);
};

export const doSourceOneInchGasEstimation = async (
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
  let obj: SwapOneInch = {
    amountIn: amount,
    amountOut: req.query.sourceAmountOut,
    targetChainId: req.query.destinationNetworkChainId,
    targetTokenAddress: await (
      global as any
    ).commonFunctions.getOneInchTokenAddress(
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
  };
  return await sourceOneInchGasEstimation(contractObj, network, obj);
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
    await (global as any).commonFunctions.getOneInchTokenAddress(
      req.query.destinationTokenContractAddress
    ),
    targetNetwork.forgeFundManager,
    salt,
    req.query.destinationAssetType,
    req.query.destinationAmountIn,
    req.query.destinationAmountOut,
    targetNetwork.foundryTokenAddress,
    req.query.destinationOneInchData,
    expiry,
    web3
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

async function getCurrentGasPrice(chainId: string, provider: any) {
  try {
    let gasPrice: any;
    if (await isAllowedAggressivePriceForDynamicGasEstimation(chainId)) {
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
    let currentGasPrice = await getCurrentGasPrice(chainId, provider);
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
  provider: any
) {
  try {
    let currentGasPrice = await getCurrentGasPrice(chainId, provider);
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
    gasPriceInToUSD = await addBuffer_(gasPriceInToUSD, chainId);
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
  destinationGasPricesInUsd: any,
  provider: any
) {
  try {
    let nativeToken = await (global as any).commonFunctions.getTokenByChainId(
      chainId
    );
    let usdPrice = await getQuote(nativeToken?.symbol);
    let gasPriceInNative = new Big(destinationGasPricesInUsd).div(usdPrice);
    let decimals = await (global as any).commonFunctions.decimals(
      provider,
      nativeToken?.wrappedAddress
    );
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
    let amountIntoDeciaml = (global as any).commonFunctions.numberIntoDecimals(
      amount,
      decimals
    );
    return amountIntoDeciaml;
  } catch (e) {
    console.error(e);
  }
}
