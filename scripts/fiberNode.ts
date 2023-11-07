var tokenAbi = require("../artifacts/contracts/token/Token.sol/Token.json");
var { ethers } = require("ethers");
var signer = new ethers.Wallet((global as any).environment.PRI_KEY);
import {
  getSourceAssetTypes,
  getTargetAssetTypes,
} from "../app/lib/middlewares/helpers/assetTypeHelper";
import { getAmountOut } from "../app/lib/middlewares/helpers/dexContractHelper";
import { OneInchSwap } from "../app/lib/httpCalls/oneInchAxiosHelper";

module.exports = {
  categoriseSwapAssets: async function (
    sourceChainId: any,
    sourceTokenAddress: any,
    targetChainId: any,
    targetTokenAddress: any,
    inputAmount: any
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
    let destinationAmountOut;
    let machineSourceBridgeAmountIntoSourceDecimal: any;
    let machineSourceBridgeAmountIntoTargetDecimal: any;
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
      let amount = (inputAmount * 10 ** Number(sourceTokenDecimal)).toString();
      amount = (global as any).utils.convertFromExponentialToDecimal(amount);

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
        console.log("Source Token is Foundry Asset");
        // approve to fiber router to transfer tokens to the fund manager contract
        sourceBridgeAmount = inputAmount;
      } else if (isRefineryAsset) {
        console.log("Source Token is Refinery Asset");
        let path = [sourceTokenAddress, sourceNetwork.foundryTokenAddress];
        let response = await getAmountOut(sourceNetwork, path, String(amount));
        if (response?.responseMessage) {
          throw response?.responseMessage;
        }
        const amountsOut = response?.amounts[1];
        sourceBridgeAmount = (
          amountsOut /
          10 ** Number(sourceFoundryTokenDecimal)
        ).toString();
      } else if (isIonicAsset) {
        console.log("SN-1: Source Token is Ionic Asset");
        //swap refinery token to the foundry token
        let path = [
          sourceTokenAddress,
          sourceNetwork.weth,
          sourceNetwork.foundryTokenAddress,
        ];
        let response = await getAmountOut(sourceNetwork, path, String(amount));
        if (response?.responseMessage) {
          throw response?.responseMessage;
        }
        const amountsOut = response?.amounts[response?.amounts.length - 1];
        sourceBridgeAmount = (
          amountsOut /
          10 ** Number(sourceFoundryTokenDecimal)
        ).toString();
        //wait until the transaction be completed
      } else {
        // 1Inch implementation
        let response = await OneInchSwap(
          sourceChainId,
          sourceTokenAddress,
          sourceNetwork?.foundryTokenAddress,
          amount,
          sourceNetwork?.fiberRouter
        );
        if (response?.responseMessage) {
          throw response?.responseMessage;
        }

        if (response && response.amounts) {
          machineSourceBridgeAmountIntoSourceDecimal = response.amounts;
          sourceBridgeAmount = (
            response.amounts /
            10 ** Number(sourceFoundryTokenDecimal)
          ).toString();
        }

        if (response && response.data) {
          sourceOneInchData = response.data;
        }
      }
    } else if (sourceNetwork.isNonEVM) {
      const recentCudosPriceInDollars =
        await machineSourceBridgeAmountIntoTargetDecimal.getCudosPrice();
      sourceBridgeAmount = (await inputAmount) * recentCudosPriceInDollars;
      sourceAssetType = "Foundry";
    }

    // destination
    if (!targetNetwork.isNonEVM) {
      const targetSigner = signer.connect(targetNetwork.provider);
      // source token contract
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
      console.log("targetFoundryTokenAddress", targetFoundryTokenAddress);

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
        console.log("TN-1: Target Token is Foundry Asset");
        destinationAmountOut = sourceBridgeAmount;
        machineSourceBridgeAmountIntoTargetDecimal = (
          sourceBridgeAmount *
          10 ** Number(targetFoundryTokenDecimal)
        ).toString();
      } else {
        console.log("isTargetRefineryToken", isTargetRefineryToken);
        if (isTargetRefineryToken == true) {
          console.log("TN-1: Target token is Refinery Asset");
          amountIn = Math.floor(amountIn);
          machineSourceBridgeAmountIntoTargetDecimal = amountIn;
          let path2 = [targetNetwork.foundryTokenAddress, targetTokenAddress];
          let response = await getAmountOut(
            targetNetwork,
            path2,
            String(Math.floor(amountIn))
          );
          if (response?.responseMessage) {
            throw response?.responseMessage;
          }
          const amountsOut2 = response?.amounts[1];

          destinationAmountOut = (
            amountsOut2 /
            10 ** Number(targetTokenDecimal)
          ).toString();
        } else if (isTargetIonicToken) {
          console.log("TN-1: Target Token is Ionic Asset");
          amountIn = Math.floor(amountIn);
          machineSourceBridgeAmountIntoTargetDecimal = amountIn;
          let path2 = [
            targetNetwork.foundryTokenAddress,
            targetNetwork.weth,
            targetTokenAddress,
          ];
          let response = await getAmountOut(
            targetNetwork,
            path2,
            String(amountIn)
          );
          if (response?.responseMessage) {
            throw response?.responseMessage;
          }
          const amountsOut2 = response?.amounts[response?.amounts.length - 1];

          destinationAmountOut = (
            amountsOut2 /
            10 ** Number(targetTokenDecimal)
          ).toString();
        } else {
          // 1Inch implementation
          let machineAmount: any = (
            sourceBridgeAmount *
            10 ** Number(targetFoundryTokenDecimal)
          ).toString();
          machineAmount = Math.floor(machineAmount);
          machineSourceBridgeAmountIntoTargetDecimal = machineAmount;
          machineAmount = (global as any).utils.convertFromExponentialToDecimal(
            machineAmount
          );

          let response = await OneInchSwap(
            targetChainId,
            targetNetwork?.foundryTokenAddress,
            targetTokenAddress,
            machineAmount,
            targetNetwork?.fiberRouter
          );

          if (response?.responseMessage) {
            throw response?.responseMessage;
          }

          if (response && response.amounts) {
            destinationAmountOut = (
              response.amounts /
              10 ** Number(targetTokenDecimal)
            ).toString();
          }
        }
      }
    } else if (targetNetwork.isNonEVM) {
      const recentCudosPriceInDollars =
        await cudosPriceAxiosHelper.getCudosPrice();
      destinationAmountOut =
        (await sourceBridgeAmount) / recentCudosPriceInDollars;
      machineSourceBridgeAmountIntoTargetDecimal =
        destinationAmountOut * 10 ** 18;
      machineSourceBridgeAmountIntoTargetDecimal = (
        global as any
      ).utils.convertFromExponentialToDecimal(
        machineSourceBridgeAmountIntoTargetDecimal
      );
      targetAssetType = "Foundry";
    }

    console.log(
      "machineSourceBridgeAmount",
      machineSourceBridgeAmountIntoTargetDecimal
    );
    if (!targetNetwork.isNonEVM) {
      machineSourceBridgeAmountIntoTargetDecimal = String(
        Math.floor(machineSourceBridgeAmountIntoTargetDecimal)
      );
      console.log(
        "machineSourceBridgeAmount",
        machineSourceBridgeAmountIntoTargetDecimal
      );
    }

    let data: any = { source: {}, destination: {} };
    data.source.type = sourceAssetType;
    data.source.amount = inputAmount;
    if (machineSourceBridgeAmountIntoSourceDecimal) {
      data.source.bridgeAmount = (
        global as any
      ).utils.convertFromExponentialToDecimal(
        machineSourceBridgeAmountIntoSourceDecimal
      );
    }
    data.source.oneInchData = sourceOneInchData;

    data.destination.type = targetAssetType;
    data.destination.amount = String(destinationAmountOut);
    data.destination.bridgeAmount = (
      global as any
    ).utils.convertFromExponentialToDecimal(
      machineSourceBridgeAmountIntoTargetDecimal
    );
    return data;
  },
};
