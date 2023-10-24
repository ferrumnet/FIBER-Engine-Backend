var tokenAbi = require("../artifacts/contracts/token/Token.sol/Token.json");
var { ethers } = require("ethers");
var signer = new ethers.Wallet((global as any).environment.PRI_KEY);
import {
  getSourceAssetTypes,
  getTargetAssetTypes,
} from "../app/lib/middlewares/helpers/assetTypeHelper";
import { getAmountOut } from "../app/lib/middlewares/helpers/dexContractHelper";

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
    let destinationAmountOut;
    let machineSourceBridgeAmount: any;
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

      if (isFoundryAsset) {
        sourceAssetType = "Foundry";
      } else if (isRefineryAsset) {
        sourceAssetType = "Refinery";
      } else {
        sourceAssetType = "Ionic";
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
      } else {
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
      }
    } else if (sourceNetwork.isNonEVM) {
      const recentCudosPriceInDollars =
        await cudosPriceAxiosHelper.getCudosPrice();
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

      if (isTargetTokenFoundry) {
        targetAssetType = "Foundry";
      } else if (isTargetRefineryToken) {
        targetAssetType = "Refinery";
      } else {
        targetAssetType = "Ionic";
      }
      if (isTargetTokenFoundry === true) {
        console.log("TN-1: Target Token is Foundry Asset");
        destinationAmountOut = sourceBridgeAmount;
        machineSourceBridgeAmount = (
          sourceBridgeAmount *
          10 ** Number(targetFoundryTokenDecimal)
        ).toString();
      } else {
        console.log("isTargetRefineryToken", isTargetRefineryToken);
        if (isTargetRefineryToken == true) {
          console.log("TN-1: Target token is Refinery Asset");
          amountIn = Math.floor(amountIn);
          machineSourceBridgeAmount = amountIn;
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
        } else {
          console.log("TN-1: Target Token is Ionic Asset");
          amountIn = Math.floor(amountIn);
          machineSourceBridgeAmount = amountIn;
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
        }
      }
    } else if (targetNetwork.isNonEVM) {
      const recentCudosPriceInDollars =
        await cudosPriceAxiosHelper.getCudosPrice();
      destinationAmountOut =
        (await sourceBridgeAmount) / recentCudosPriceInDollars;
      machineSourceBridgeAmount = destinationAmountOut * 10 ** 18;
      machineSourceBridgeAmount = (
        global as any
      ).utils.convertFromExponentialToDecimal(machineSourceBridgeAmount);
      targetAssetType = "Foundry";
    }

    console.log("machineSourceBridgeAmount", machineSourceBridgeAmount);
    if (!targetNetwork.isNonEVM) {
      machineSourceBridgeAmount = String(Math.floor(machineSourceBridgeAmount));
      console.log("machineSourceBridgeAmount", machineSourceBridgeAmount);
    }

    let data: any = { source: {}, destination: {} };
    data.source.type = sourceAssetType;
    data.source.amount = inputAmount;

    data.destination.type = targetAssetType;
    data.destination.amount = String(destinationAmountOut);
    data.destination.bridgeAmount = (
      global as any
    ).utils.convertFromExponentialToDecimal(machineSourceBridgeAmount);
    return data;
  },
};
