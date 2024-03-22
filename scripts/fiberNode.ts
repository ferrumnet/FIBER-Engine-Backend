var tokenAbi = require("../artifacts/contracts/token/Token.sol/Token.json");
var { ethers } = require("ethers");
import {
  getSourceAssetTypes,
  getTargetAssetTypes,
} from "../app/lib/middlewares/helpers/assetTypeHelper";
import { getAmountOut } from "../app/lib/middlewares/helpers/dexContractHelper";
import { OneInchSwap } from "../app/lib/httpCalls/oneInchAxiosHelper";
import {
  isLiquidityAvailableForEVM,
  isLiquidityAvailableForCudos,
} from "../app/lib/middlewares/helpers/liquidityHelper";
import { IN_SUFFICIENT_LIQUIDITY_ERROR } from "../app/lib/middlewares/helpers/withdrawResponseHelper";
import { swapIsNotAvailable } from "../app/lib/middlewares/helpers/stringHelper";
import { getSourceAmountOut } from "../app/lib/middlewares/helpers/fiberNodeHelper";
import {
  removeSelector,
  getSelector,
} from "../app/lib/middlewares/helpers/oneInchDecoderHelper";
import { isValidOneInchSelector } from "../app/lib/middlewares/helpers/configurationHelper";

module.exports = {
  categoriseSwapAssets: async function (
    sourceChainId: any,
    sourceTokenAddress: any,
    targetChainId: any,
    targetTokenAddress: any,
    inputAmount: any,
    destinationWalletAddress: string,
    gasEstimationDestinationAmount: string,
    slippage: string
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
    let sourceOneInchData;
    let destinationOneInchData;
    let destinationAmountOut;
    let machineSourceAmountOut: any;
    let machineDestinationAmountIn: any;
    let machineDestinationAmountOut: any;
    let targetFoundryTokenAddress;

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
      let amount = (global as any).commonFunctions.numberIntoDecimals(
        inputAmount,
        sourceTokenDecimal
      );
      let sourceTypeResponse = await getSourceAssetTypes(
        sourceNetwork,
        await (global as any).commonFunctions.getWrappedNativeTokenAddress(
          sourceTokenAddress,
          sourceChainId
        ),
        amount
      );
      const isFoundryAsset = sourceTypeResponse.isFoundryAsset;
      const isRefineryAsset = sourceTypeResponse.isRefineryAsset;
      const isIonicAsset = sourceTypeResponse.isIonicAsset;
      const isOneInchAsset = sourceTypeResponse.isOneInch;
      if (isFoundryAsset) {
        sourceAssetType = (global as any).utils.assetType.FOUNDARY;
      } else if (isRefineryAsset) {
        sourceAssetType = (global as any).utils.assetType.REFINERY;
      } else if (isIonicAsset) {
        sourceAssetType = (global as any).utils.assetType.IONIC;
      } else {
        sourceAssetType = (global as any).utils.assetType.ONE_INCH;
      }

      if (isFoundryAsset) {
        sourceBridgeAmount = inputAmount;
      } else {
        let response = await OneInchSwap(
          sourceChainId,
          await (global as any).commonFunctions.getWrappedNativeTokenAddress(
            sourceTokenAddress,
            sourceChainId
          ),
          sourceNetwork?.foundryTokenAddress,
          amount,
          sourceNetwork?.fiberRouter,
          sourceNetwork?.fundManager,
          slippage
        );
        if (response?.responseMessage) {
          throw response?.responseMessage;
        }

        if (response && response.amounts) {
          machineSourceAmountOut = response.amounts;
          machineSourceAmountOut = await (
            global as any
          ).commonFunctions.addSlippageInDecimal(
            machineSourceAmountOut,
            slippage
          );
          sourceBridgeAmount = (
            global as any
          ).commonFunctions.decimalsIntoNumber(
            machineSourceAmountOut,
            sourceFoundryTokenDecimal
          );
        }
        if (response && response.data) {
          sourceOneInchData = response.data;
        }
        if (
          sourceOneInchData &&
          !(await isValidOneInchSelector(getSelector(sourceOneInchData)))
        ) {
          throw swapIsNotAvailable;
        }
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
        await this.delay(1000);
        let response = await OneInchSwap(
          targetChainId,
          targetNetwork?.foundryTokenAddress,
          await (global as any).commonFunctions.getOneInchTokenAddress(
            targetTokenAddress
          ),
          machineAmount,
          targetNetwork?.fiberRouter,
          destinationWalletAddress,
          slippage
        );
        if (response?.responseMessage) {
          throw response?.responseMessage;
        }
        if (response && response.data) {
          destinationOneInchData = response.data;
        }
        if (response && response.amounts) {
          machineDestinationAmountOut = response.amounts;
          machineDestinationAmountOut = await (
            global as any
          ).commonFunctions.addSlippageInDecimal(
            machineDestinationAmountOut,
            slippage
          );
          destinationAmountOut = (
            global as any
          ).commonFunctions.decimalsIntoNumber(
            machineDestinationAmountOut,
            targetTokenDecimal
          );
        }
      }
      console.log("machineDestinationAmountIn", machineDestinationAmountIn);
      console.log("machineDestinationAmountOut", machineDestinationAmountOut);
    }

    if (!targetNetwork.isNonEVM) {
      let isValidLiquidityAvailable = await isLiquidityAvailableForEVM(
        targetNetwork.foundryTokenAddress,
        targetNetwork.fundManager,
        targetNetwork.provider,
        (global as any).utils.convertFromExponentialToDecimal(
          machineDestinationAmountIn
        )
      );
      if (!isValidLiquidityAvailable) {
        throw IN_SUFFICIENT_LIQUIDITY_ERROR;
      }
      if (
        destinationOneInchData &&
        !(await isValidOneInchSelector(getSelector(destinationOneInchData)))
      ) {
        throw swapIsNotAvailable;
      }
    } else {
      let isValidLiquidityAvailable = await isLiquidityAvailableForCudos(
        targetNetwork.foundryTokenAddress,
        targetNetwork.fundManager,
        targetNetwork.rpcUrl,
        (global as any).environment.DESTINATION_CHAIN_PRIV_KEY,
        (global as any).utils.convertFromExponentialToDecimal(
          machineDestinationAmountIn
        )
      );
      if (!isValidLiquidityAvailable) {
        throw IN_SUFFICIENT_LIQUIDITY_ERROR;
      }
    }

    let data: any = { source: {}, destination: {} };
    data.source.type = sourceAssetType;
    data.source.amount = inputAmount;
    if (machineSourceAmountOut) {
      data.source.bridgeAmount = machineSourceAmountOut;
    }
    data.source.oneInchData = sourceOneInchData;

    data.destination.type = targetAssetType;
    data.destination.amount = String(destinationAmountOut);
    data.destination.bridgeAmountIn = machineDestinationAmountIn;
    data.destination.bridgeAmountOut = machineDestinationAmountOut;
    data.destination.oneInchData = destinationOneInchData;
    return data;
  },

  delay: function (ms: any) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  },
};
