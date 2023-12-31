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

module.exports = {
  categoriseSwapAssets: async function (
    sourceChainId: any,
    sourceTokenAddress: any,
    targetChainId: any,
    targetTokenAddress: any,
    inputAmount: any,
    destinationWalletAddress: string
  ) {
    const sourceNetwork = (global as any).commonFunctions.getNetworkByChainId(
      sourceChainId
    ).multiswapNetworkFIBERInformation;
    const targetNetwork = (global as any).commonFunctions.getNetworkByChainId(
      targetChainId
    ).multiswapNetworkFIBERInformation;
    let targetAssetType;
    let sourceAssetType;
    let sourceBridgeAmount;
    let sourceOneInchData;
    let destinationOneInchData;
    let destinationAmountOut;
    let machineSourceAmountOut: any;
    let machineDestinationAmountIn: any;
    let machineDestinationAmountOut: any;
    let targetFoundryTokenAddress;

    // source
    if (!sourceNetwork.isNonEVM) {
      const sourceTokenContract = new ethers.Contract(
        sourceTokenAddress,
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
        sourceTokenAddress,
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
        // approve to fiber router to transfer tokens to the fund manager contract
        sourceBridgeAmount = inputAmount;
        // } else if (isRefineryAsset) {
        //   let path = [sourceTokenAddress, sourceNetwork.foundryTokenAddress];
        //   let response = await getAmountOut(sourceNetwork, path, String(amount));
        //   if (response?.responseMessage) {
        //     throw response?.responseMessage;
        //   }
        //   const amountsOut = response?.amounts[1];
        //   sourceBridgeAmount = (
        //     amountsOut /
        //     10 ** Number(sourceFoundryTokenDecimal)
        //   ).toString();
        // } else if (isIonicAsset) {
        //   //swap refinery token to the foundry token
        //   let path = [
        //     sourceTokenAddress,
        //     sourceNetwork.weth,
        //     sourceNetwork.foundryTokenAddress,
        //   ];
        //   let response = await getAmountOut(sourceNetwork, path, String(amount));
        //   if (response?.responseMessage) {
        //     throw response?.responseMessage;
        //   }
        //   const amountsOut = response?.amounts[response?.amounts.length - 1];
        //   sourceBridgeAmount = (
        //     amountsOut /
        //     10 ** Number(sourceFoundryTokenDecimal)
        //   ).toString();
        //wait until the transaction be completed
      } else {
        // 1Inch implementation
        let response = await OneInchSwap(
          sourceChainId,
          sourceTokenAddress,
          sourceNetwork?.foundryTokenAddress,
          amount,
          sourceNetwork?.fiberRouter,
          sourceNetwork?.fundManager
        );
        if (response?.responseMessage) {
          throw response?.responseMessage;
        }

        if (response && response.amounts) {
          machineSourceAmountOut = response.amounts;
          machineSourceAmountOut = await (
            global as any
          ).commonFunctions.calculateValueWithSlippage(machineSourceAmountOut);
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
      }
    }
    // else if (sourceNetwork.isNonEVM) {
    // const recentCudosPriceInDollars =
    //   await cudosPriceAxiosHelper.getCudosPrice();
    // sourceBridgeAmount = (await inputAmount) * recentCudosPriceInDollars;
    // sourceAssetType = "Foundry";
    // }

    // destination
    if (!targetNetwork.isNonEVM) {
      const targetTokenContract = new ethers.Contract(
        targetTokenAddress,
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
      //convert to wei
      const targetTokenDecimal = await targetTokenContract.decimals();
      const targetFoundryTokenDecimal =
        await targetFoundryTokenContract.decimals();
      let amountIn: any = (
        sourceBridgeAmount *
        10 ** Number(targetFoundryTokenDecimal)
      ).toString();
      amountIn = parseInt(amountIn);
      let targetTypeResponse = await getTargetAssetTypes(
        targetNetwork,
        targetTokenAddress,
        Math.floor(amountIn)
      );

      const isTargetTokenFoundry = targetTypeResponse.isFoundryAsset;
      const isTargetRefineryToken = targetTypeResponse.isRefineryAsset;
      const isTargetIonicToken = targetTypeResponse.isIonicAsset;
      const isTargetOneInchToken = targetTypeResponse.isOneInch;

      if (isTargetTokenFoundry) {
        targetAssetType = (global as any).utils.assetType.FOUNDARY;
      } else if (isTargetRefineryToken) {
        targetAssetType = (global as any).utils.assetType.REFINERY;
      } else if (isTargetIonicToken) {
        targetAssetType = (global as any).utils.assetType.IONIC;
      } else {
        targetAssetType = (global as any).utils.assetType.ONE_INCH;
      }

      if (isTargetTokenFoundry === true) {
        destinationAmountOut = sourceBridgeAmount;
        machineDestinationAmountIn = (
          sourceBridgeAmount *
          10 ** Number(targetFoundryTokenDecimal)
        ).toString();
        machineDestinationAmountIn = Math.floor(machineDestinationAmountIn);
      } else {
        // if (isTargetRefineryToken == true) {
        //   amountIn = Math.floor(amountIn);
        //   machineDestinationAmountIn = amountIn;
        //   let path2 = [targetNetwork.foundryTokenAddress, targetTokenAddress];
        //   let response = await getAmountOut(
        //     targetNetwork,
        //     path2,
        //     String(Math.floor(amountIn))
        //   );
        //   if (response?.responseMessage) {
        //     throw response?.responseMessage;
        //   }
        //   const amountsOut2 = response?.amounts[1];

        //   destinationAmountOut = (
        //     amountsOut2 /
        //     10 ** Number(targetTokenDecimal)
        //   ).toString();
        // } else if (isTargetIonicToken) {
        //   amountIn = Math.floor(amountIn);
        //   machineDestinationAmountIn = amountIn;
        //   let path2 = [
        //     targetNetwork.foundryTokenAddress,
        //     targetNetwork.weth,
        //     targetTokenAddress,
        //   ];
        //   let response = await getAmountOut(
        //     targetNetwork,
        //     path2,
        //     String(amountIn)
        //   );
        //   if (response?.responseMessage) {
        //     throw response?.responseMessage;
        //   }
        //   const amountsOut2 = response?.amounts[response?.amounts.length - 1];

        //   destinationAmountOut = (
        //     amountsOut2 /
        //     10 ** Number(targetTokenDecimal)
        //   ).toString();
        // } else {
        // 1Inch implementation
        let machineAmount: any = (
          sourceBridgeAmount *
          10 ** Number(targetFoundryTokenDecimal)
        ).toString();
        machineAmount = Math.floor(machineAmount);
        machineDestinationAmountIn = machineAmount;
        machineAmount = (global as any).utils.convertFromExponentialToDecimal(
          machineAmount
        );
        await this.delay(1000);
        let response = await OneInchSwap(
          targetChainId,
          targetNetwork?.foundryTokenAddress,
          targetTokenAddress,
          machineAmount,
          targetNetwork?.fiberRouter,
          destinationWalletAddress
        );

        if (response?.responseMessage) {
          throw response?.responseMessage;
        }

        if (response && response.data) {
          destinationOneInchData = response.data;
        }

        if (response && response.amounts) {
          machineDestinationAmountOut = response.amounts;
          destinationAmountOut = (
            response.amounts /
            10 ** Number(targetTokenDecimal)
          ).toString();
        }
        // }
      }
    }
    // else if (targetNetwork.isNonEVM) {
    //   const recentCudosPriceInDollars =
    //     await cudosPriceAxiosHelper.getCudosPrice();
    //   destinationAmountOut =
    //     (await sourceBridgeAmount) / recentCudosPriceInDollars;
    //   machineDestinationAmountIn = destinationAmountOut * 10 ** 18;
    //   machineDestinationAmountIn = (
    //     global as any
    //   ).utils.convertFromExponentialToDecimal(machineDestinationAmountIn);
    //   targetAssetType = "Foundry";
    // }

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
