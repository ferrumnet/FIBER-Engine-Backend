var tokenAbi = require("../artifacts/contracts/token/Token.sol/Token.json");
var { ethers } = require("ethers");
import {
  getSourceAssetTypes,
  getTargetAssetTypes,
} from "../app/lib/middlewares/helpers/tokenQuoteAndTypeHelpers/assetTypeHelper";
import { getAmountOut } from "../app/lib/middlewares/helpers/dexContractHelper";
import { OneInchSwap } from "../app/lib/httpCalls/oneInchAxiosHelper";
import {
  checkForCCTP,
  isLiquidityAvailableForEVM,
} from "../app/lib/middlewares/helpers/liquidityHelper";
import { IN_SUFFICIENT_LIQUIDITY_ERROR } from "../app/lib/middlewares/helpers/withdrawResponseHelper";
import { swapIsNotAvailable } from "../app/lib/middlewares/helpers/stringHelper";
import { getSourceAmountOut } from "../app/lib/middlewares/helpers/fiberNodeHelper";
import {
  removeSelector,
  getSelector,
} from "../app/lib/middlewares/helpers/oneInchDecoderHelper";
import { isValidOneInchSelector } from "../app/lib/middlewares/helpers/configurationHelper";
import { query } from "express";
import { chooseProviderAndGetData } from "../app/lib/middlewares/helpers/tokenQuoteAndTypeHelpers/quoteProvidersHelper";
import {
  getDataAfterCutDistributionFee,
  getFeeDistributionObject,
} from "../app/lib/middlewares/helpers/feeDistribution/feeDistributionHelper";
import { FeeDistribution } from "../app/interfaces/feeDistributionInterface";

module.exports = {
  getQouteAndTypeForCrossNetworks: async function (
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
  ) {
    const sourceNetwork = (global as any).commonFunctions.getNetworkByChainId(
      sourceChainId
    ).multiswapNetworkFIBERInformation;
    const targetNetwork = (global as any).commonFunctions.getNetworkByChainId(
      targetChainId
    ).multiswapNetworkFIBERInformation;
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

    // source
    if (!sourceNetwork.isNonEVM && !gasEstimationDestinationAmount) {
      const sourceTokenContract = new ethers.Contract(
        await (global as any).commonFunctions.getWrappedNativeTokenAddress(
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
      const sourceFoundryTokenDecimal =
        await sourceFoundryTokenContract.decimals();
      machineSourceAmountIn = (
        global as any
      ).commonFunctions.numberIntoDecimals(inputAmount, sourceTokenDecimal);
      let sourceTypeResponse = await getSourceAssetTypes(
        sourceNetwork,
        await (global as any).commonFunctions.getWrappedNativeTokenAddress(
          sourceTokenAddress,
          sourceChainId
        ),
        machineSourceAmountIn
      );
      const isFoundryAsset = sourceTypeResponse.isFoundryAsset;
      if (isFoundryAsset) {
        sourceAssetType = (global as any).utils.assetType.FOUNDARY;
      } else {
        sourceAssetType = (global as any).utils.assetType.ONE_INCH;
      }

      if (isFoundryAsset) {
        machineSourceAmountOut = machineSourceAmountIn;
        const { amountAfterCut, data } = await getDataAfterCutDistributionFee(
          referralCode,
          machineSourceAmountOut
        );
        machineSourceAmountOut = amountAfterCut;
        feeDistribution = data;
        sourceBridgeAmount = (global as any).commonFunctions.decimalsIntoNumber(
          machineSourceAmountOut,
          sourceFoundryTokenDecimal
        );
      } else {
        let response: any = await chooseProviderAndGetData(
          sourceChainId,
          await (global as any).commonFunctions.getWrappedNativeTokenAddress(
            sourceTokenAddress,
            sourceChainId
          ),
          sourceNetwork?.foundryTokenAddress,
          machineSourceAmountIn,
          sourceSlippage,
          sourceNetwork?.fiberRouter,
          sourceNetwork?.fiberRouter
        );
        sourceCallData = response.callData;
        machineSourceAmountOut = response.amounts;
        machineSourceAmountOut = await (
          global as any
        ).commonFunctions.addSlippageInDecimal(
          machineSourceAmountOut,
          sourceSlippage
        );
        const { amountAfterCut, data } = await getDataAfterCutDistributionFee(
          referralCode,
          machineSourceAmountOut
        );
        machineSourceAmountOut = amountAfterCut;
        feeDistribution = data;
        sourceBridgeAmount = (global as any).commonFunctions.decimalsIntoNumber(
          machineSourceAmountOut,
          sourceFoundryTokenDecimal
        );
      }
    }

    // destination
    if (!targetNetwork.isNonEVM) {
      const targetTokenContract = new ethers.Contract(
        await (global as any).commonFunctions.getWrappedNativeTokenAddress(
          targetTokenAddress,
          targetChainId
        ),
        tokenAbi.abi,
        targetNetwork.provider
      );
      if (
        targetChainId == (global as any).utils.arbitrumChainID &&
        targetTokenAddress == (global as any).utils.cFRMTokenAddress
      ) {
        targetFoundryTokenAddress = targetTokenAddress;
      } else {
        targetFoundryTokenAddress = targetNetwork.foundryTokenAddress;
      }
      const targetFoundryTokenContract = new ethers.Contract(
        targetFoundryTokenAddress,
        tokenAbi.abi,
        targetNetwork.provider
      );
      const targetTokenDecimal = await targetTokenContract.decimals();
      const targetFoundryTokenDecimal =
        await targetFoundryTokenContract.decimals();
      let amountIn: any = (global as any).commonFunctions.numberIntoDecimals__(
        getSourceAmountOut(gasEstimationDestinationAmount, sourceBridgeAmount),
        targetFoundryTokenDecimal
      );
      let targetTypeResponse = await getTargetAssetTypes(
        targetNetwork,
        await (global as any).commonFunctions.getWrappedNativeTokenAddress(
          targetTokenAddress,
          targetChainId
        ),
        amountIn
      );
      const isTargetTokenFoundry = targetTypeResponse.isFoundryAsset;
      if (isTargetTokenFoundry) {
        targetAssetType = (global as any).utils.assetType.FOUNDARY;
      } else {
        targetAssetType = (global as any).utils.assetType.ONE_INCH;
      }
      if (isTargetTokenFoundry === true) {
        sourceBridgeAmount = getSourceAmountOut(
          gasEstimationDestinationAmount,
          sourceBridgeAmount
        );
        destinationAmountOut = sourceBridgeAmount;
        machineDestinationAmountIn = (
          global as any
        ).commonFunctions.numberIntoDecimals__(
          sourceBridgeAmount,
          targetFoundryTokenDecimal
        );
      } else {
        sourceBridgeAmount = getSourceAmountOut(
          gasEstimationDestinationAmount,
          sourceBridgeAmount
        );
        let machineAmount: any = (
          global as any
        ).commonFunctions.numberIntoDecimals__(
          sourceBridgeAmount,
          targetFoundryTokenDecimal
        );
        machineDestinationAmountIn = machineAmount;
        machineAmount = (global as any).utils.convertFromExponentialToDecimal(
          machineAmount
        );
        if (machineAmount <= 0) {
          throw swapIsNotAvailable;
        }
        let response: any = await chooseProviderAndGetData(
          targetChainId,
          targetNetwork?.foundryTokenAddress,
          await (global as any).commonFunctions.getNativeTokenAddress(
            targetTokenAddress
          ),
          machineAmount,
          destinationSlippage,
          targetNetwork?.fiberRouter,
          destinationWalletAddress
        );
        destinationCallData = response.callData;
        machineDestinationAmountOut = response.amounts;
        destinationAmountOut = (
          global as any
        ).commonFunctions.decimalsIntoNumber(
          machineDestinationAmountOut,
          targetTokenDecimal
        );
        machineDestinationAmountOut = await (
          global as any
        ).commonFunctions.addSlippageInDecimal(
          machineDestinationAmountOut,
          destinationSlippage
        );
        minDestinationAmountOut = (
          global as any
        ).commonFunctions.decimalsIntoNumber(
          machineDestinationAmountOut,
          targetTokenDecimal
        );
      }
      isCCTP = await checkForCCTP(
        targetNetwork.foundryTokenAddress,
        targetNetwork.fundManager,
        targetNetwork.provider,
        (global as any).utils.convertFromExponentialToDecimal(
          machineDestinationAmountIn
        ),
        targetFoundryTokenDecimal,
        targetChainId
      );
      console.log("machineDestinationAmountIn", machineDestinationAmountIn);
      console.log("machineDestinationAmountOut", machineDestinationAmountOut);
    }

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
  },
};
