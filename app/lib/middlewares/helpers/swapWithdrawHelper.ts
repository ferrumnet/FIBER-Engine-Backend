var { ethers } = require("ethers");
var Web3 = require("web3");
require("dotenv").config();
const fiberRouterAbi = require("../../../../config/FiberRouter.json");
var tokenAbi = require("../../../../config/Token.json");
import {
  convertIntoAssetTypesObjectForSource,
  convertIntoAssetTypesObjectForTarget,
} from "./tokenQuoteAndTypeHelpers/assetTypeHelper";
import {
  createCudosResponse,
  createEVMResponse,
  IN_SUFFICIENT_LIQUIDITY_ERROR,
  CODE_701,
  CODE_702,
  CODE_703,
} from "./withdrawResponseHelper";
import { isLiquidityAvailableForEVM } from "./liquidityHelper";
import { getSignature, getWithdrawalDataHashForSwap } from "./signatureHelper";
import {
  doOneInchSwap,
  doFoundaryWithdraw,
  doOneInchWithdraw,
  getDestinationAmountFromLogs,
  getValueForSwap,
  doSameNetworkSwap,
  isOutOfGasError,
  doCCTPFlow,
  doSwap,
  getLatestCallData,
  handleWithdrawalErrors,
} from "./fiberEngineHelper";
import {
  SwapOneInch,
  WithdrawSigned,
  WithdrawSignedAndSwapOneInch,
  SwapSameNetwork,
  Swap,
} from "../../../interfaces/fiberEngineInterface";
import {
  getWithdrawSignedObject,
  getWithdrawSignedAndSwapOneInchObject,
  sendSlackNotification,
} from "./fiberEngineHelper";
import { isSameNetworksSwap } from "./multiSwapHelper";
import { getIsCCTP } from "./cctpHelpers/cctpHelper";
import {
  attestationSignatureError,
  genericProviderError,
} from "./stringHelper";
import { getIsStargate } from "./stargateHelpers/stargateHelper";

// user wallet
var signer = new ethers.Wallet((global as any).environment.PRI_KEY);

module.exports = {
  web3(rpcUrl: any) {
    if (rpcUrl) {
      return new Web3(new Web3.providers.HttpProvider(rpcUrl));
    }
    return null;
  },

  fiberRouterPool(rpcUrl: any, tokenContractAddress: any) {
    let web3 = this.web3(rpcUrl).eth;
    return new web3.Contract(fiberRouterAbi.abi, tokenContractAddress);
  },

  getTransactionsCount: async function (rpcUrl: any, walletAddress: any) {
    let web3 = this.web3(rpcUrl).eth;
    if (web3) {
      let transactionCount = await web3.getTransactionCount(
        walletAddress,
        "pending"
      );
      return transactionCount;
    }
    return null;
  },

  getDeadLine: function () {
    const currentDate = new Date();
    const deadLine = currentDate.getTime() + 20 * 60000;
    return deadLine;
  },

  withdraw: async function (
    sourceTokenAddress: any,
    targetTokenAddress: any,
    sourceChainId: any,
    targetChainId: any,
    inputAmount: any,
    destinationWalletAddress: any,
    swapTransactionHash: any,
    body: any
  ) {
    let isValidLiquidityAvailable = true;
    let transactionHash = "";
    let withdrawResponse;
    let destinationAmount;
    const sourceNetwork = (global as any).commonFunctions.getNetworkByChainId(
      sourceChainId
    ).multiswapNetworkFIBERInformation;
    const targetNetwork = (global as any).commonFunctions.getNetworkByChainId(
      targetChainId
    ).multiswapNetworkFIBERInformation;
    isValidLiquidityAvailable = await isLiquidityAvailableForEVM(
      targetNetwork.foundryTokenAddress,
      targetNetwork.fundManager,
      targetNetwork.provider,
      body.destinationAmountIn
    );
    if (!isValidLiquidityAvailable && !getIsCCTP(body?.isCCTP)) {
      return handleWithdrawalErrors(
        swapTransactionHash,
        IN_SUFFICIENT_LIQUIDITY_ERROR,
        CODE_701
      );
    }

    let targetTypeResponse = await convertIntoAssetTypesObjectForTarget(body);
    const targetSigner = signer.connect(targetNetwork.provider);
    const targetTokenContract = new ethers.Contract(
      await (global as any).commonFunctions.getWrappedNativeTokenAddress(
        targetTokenAddress,
        targetChainId
      ),
      tokenAbi.abi,
      targetNetwork.provider
    );
    const targetFoundryTokenContract = new ethers.Contract(
      targetNetwork.foundryTokenAddress,
      tokenAbi.abi,
      targetNetwork.provider
    );
    //convert to wei
    const targetTokenDecimal = await targetTokenContract.decimals();
    const targetFoundryTokenDecimal =
      await targetFoundryTokenContract.decimals();
    const isTargetTokenFoundry = targetTypeResponse.isFoundryAsset;
    if (isTargetTokenFoundry === true) {
      let signatureResponse: any = getSignature(body);
      let obj: WithdrawSigned = getWithdrawSignedObject(
        targetTokenAddress,
        destinationWalletAddress,
        String(signatureResponse.amount),
        signatureResponse.salt,
        body.signatureExpiry,
        String(signatureResponse.signature),
        targetNetwork,
        targetSigner,
        targetChainId,
        swapTransactionHash,
        body?.gasLimit,
        getIsCCTP(body?.isCCTP)
      );
      let res = await doCCTPFlow(
        targetNetwork,
        body?.cctpMessageBytes,
        body?.cctpMessageHash,
        getIsCCTP(body?.isCCTP)
      );
      if (res == attestationSignatureError) {
        return handleWithdrawalErrors(
          swapTransactionHash,
          attestationSignatureError,
          CODE_703
        );
      }
      const swapResult = await doFoundaryWithdraw(obj, 0);
      const receipt = await this.callEVMWithdrawAndGetReceipt(
        swapResult,
        swapTransactionHash,
        true,
        obj
      );
      destinationAmount = (
        signatureResponse.amount /
        10 ** Number(targetTokenDecimal)
      ).toString();
      withdrawResponse = createEVMResponse(receipt);
      transactionHash = withdrawResponse?.transactionHash;
    } else {
      // 1Inch implementation
      let res = await doCCTPFlow(
        targetNetwork,
        body?.cctpMessageBytes,
        body?.cctpMessageHash,
        getIsCCTP(body?.isCCTP)
      );
      if (res == attestationSignatureError) {
        return handleWithdrawalErrors(
          swapTransactionHash,
          attestationSignatureError,
          CODE_703
        );
      }
      let callData: any = await getLatestCallData(
        body?.sourceWalletAddress,
        targetChainId,
        targetNetwork?.foundryTokenAddress,
        await (global as any).commonFunctions.getNativeTokenAddress(
          targetTokenAddress
        ),
        body?.destinationAmountIn,
        body?.destinationSlippage,
        targetNetwork?.fiberRouter,
        destinationWalletAddress
      );
      if (!callData) {
        console.log("i am here");
        return handleWithdrawalErrors(
          swapTransactionHash,
          genericProviderError,
          CODE_702
        );
      }
      let signatureResponse: any = getSignature(body);
      let obj: WithdrawSignedAndSwapOneInch =
        getWithdrawSignedAndSwapOneInchObject(
          destinationWalletAddress,
          body?.destinationAmountIn,
          body?.destinationAmountOut,
          targetNetwork?.foundryTokenAddress,
          targetTokenAddress,
          callData,
          signatureResponse.salt,
          body.signatureExpiry,
          String(signatureResponse.signature),
          body.destinationOneInchSelector,
          targetNetwork,
          targetSigner,
          targetChainId,
          swapTransactionHash,
          body?.gasLimit,
          getIsCCTP(body?.isCCTP)
        );
      const swapResult = await doOneInchWithdraw(obj, 0);
      const receipt = await this.callEVMWithdrawAndGetReceipt(
        swapResult,
        swapTransactionHash,
        false,
        obj
      );
      let destinationAmountOut = getDestinationAmountFromLogs(
        receipt,
        targetNetwork?.rpcUrl,
        body?.destinationAmountOut,
        true
      );
      destinationAmount = (global as any).commonFunctions.decimalsIntoNumber(
        destinationAmountOut,
        targetTokenDecimal
      );
      withdrawResponse = createEVMResponse(receipt);
      transactionHash = withdrawResponse?.transactionHash;
    }

    let data: any = {};
    data.txHash = withdrawResponse?.transactionHash;
    data.destinationAmount = String(destinationAmount);
    data.responseCode = withdrawResponse?.responseCode;
    data.responseMessage = withdrawResponse?.responseMessage;
    return data;
  },

  swapForAbi: async function (
    sourceWalletAddress: any,
    sourceTokenAddress: any,
    targetTokenAddress: any,
    sourceChainId: any,
    targetChainId: any,
    inputAmount: any,
    destinationWalletAddress: any,
    query: any,
    body: any
  ) {
    try {
      const sourceNetwork = (global as any).commonFunctions.getNetworkByChainId(
        sourceChainId
      ).multiswapNetworkFIBERInformation;
      const targetNetwork = (global as any).commonFunctions.getNetworkByChainId(
        targetChainId
      ).multiswapNetworkFIBERInformation;

      if (sourceNetwork.isNonEVM) {
        throw "CUDOS Swap: Please Perform Swap From Frontend";
      }
      let fiberRouter = this.fiberRouterPool(
        sourceNetwork.rpc,
        sourceNetwork.fiberRouter
      );
      const sourceTokenContract = new ethers.Contract(
        await (global as any).commonFunctions.getWrappedNativeTokenAddress(
          sourceTokenAddress,
          sourceChainId
        ),
        tokenAbi.abi,
        sourceNetwork.provider
      );
      const sourceTokenDecimal = await sourceTokenContract.decimals();
      let amount = (global as any).commonFunctions.numberIntoDecimals__(
        inputAmount,
        sourceTokenDecimal
      );
      let sourceTypeResponse = await convertIntoAssetTypesObjectForSource(
        query
      );
      const isFoundryAsset = sourceTypeResponse.isFoundryAsset;
      let swapResult;
      const isSameNetworks = isSameNetworksSwap(sourceChainId, targetChainId);
      if (isSameNetworks) {
        let obj: SwapSameNetwork = {
          amountIn: query?.destinationAmountIn,
          amountOut: query?.destinationAmountOut,
          targetTokenAddress: await (
            global as any
          ).commonFunctions.getNativeTokenAddress(
            query?.destinationTokenContractAddress
          ),
          destinationWalletAddress: query?.destinationWalletAddress,
          destinationOneInchData: query?.destinationOneInchData,
          sourceTokenAddress: query?.sourceTokenContractAddress,
          sourceWalletAddress: query?.sourceWalletAddress,
          oneInchSelector: query?.destinationOneInchSelector,
          aggregateRouterContractAddress:
            sourceNetwork.aggregateRouterContractAddress,
        };
        swapResult = await doSameNetworkSwap(obj, fiberRouter);
      } else if (isFoundryAsset) {
        let obj: Swap = {
          sourceTokenAddress: sourceTokenAddress,
          amount: amount,
          targetChainId: targetChainId,
          targetTokenAddress: targetTokenAddress,
          destinationWalletAddress: destinationWalletAddress,
          withdrawalData: getWithdrawalDataHashForSwap(
            query?.sourceOneInchData,
            query?.destinationOneInchData,
            query?.destinationAmountIn,
            query?.destinationAmountOut,
            query?.sourceAssetType,
            query?.destinationAssetType
          ),
          sourceWalletAddress: sourceWalletAddress,
          value: "",
          isCCTP: getIsCCTP(query?.isCCTP),
          feeDistribution: body?.feeDistribution,
          isStargate: getIsStargate(query?.isStargate),
        };
        swapResult = await doSwap(obj, fiberRouter);
      } else {
        // 1Inch implementation
        let withdrawalData = getWithdrawalDataHashForSwap(
          query?.sourceOneInchData,
          query?.destinationOneInchData,
          query?.destinationAmountIn,
          query?.destinationAmountOut,
          query?.sourceAssetType,
          query?.destinationAssetType
        );
        let obj: SwapOneInch = {
          amountIn: amount,
          amountOut: query?.sourceAmountOut,
          targetChainId: targetChainId,
          targetTokenAddress: targetTokenAddress,
          destinationWalletAddress: destinationWalletAddress,
          sourceOneInchData: query?.sourceOneInchData,
          sourceTokenAddress: sourceTokenAddress,
          foundryTokenAddress: sourceNetwork.foundryTokenAddress,
          withdrawalData: withdrawalData,
          gasPrice: query?.gasPrice,
          oneInchSelector: query?.sourceOneInchSelector,
          aggregateRouterContractAddress:
            sourceNetwork.aggregateRouterContractAddress,
          isCCTP: getIsCCTP(query?.isCCTP),
          feeDistribution: body?.feeDistribution,
        };
        swapResult = await doOneInchSwap(obj, fiberRouter);
      }

      let data = "";
      if (swapResult) {
        data = swapResult.encodeABI();
      }
      let nonce = await this.getTransactionsCount(
        sourceNetwork.rpc,
        sourceWalletAddress
      );

      let returnData: any = {
        currency: sourceNetwork.shortName + ":" + sourceTokenAddress,
        from: sourceWalletAddress,
        amount: "0",
        contract: sourceNetwork.fiberRouter,
        data: data,
        nonce,
        description: `Swap `,
      };
      let value = getValueForSwap(
        amount,
        query?.gasPrice,
        await (global as any).commonFunctions.isNativeToken(sourceTokenAddress),
        isSameNetworks
      );
      returnData = { ...returnData, value: value };
      return returnData;
    } catch (error) {
      console.log("error", error);
      throw { error };
    }
  },

  callEVMWithdrawAndGetReceipt: async function (
    data: any,
    swapTransactionHash: string,
    isFoundary: boolean,
    objForWithdraw: any,
    count = 0
  ) {
    let receipt: any = { status: 0, responseMessage: "" };
    try {
      receipt = await data?.wait();
    } catch (e: any) {
      receipt.responseMessage = e;
      sendSlackNotification(swapTransactionHash, e, "Not available");
      if ((await isOutOfGasError(e, data.dynamicGasPrice)) && count < 3) {
        count = count + 1;
        console.log("count", count, "extraBuffer:", count * 100);
        let result;
        if (isFoundary) {
          result = await doFoundaryWithdraw(objForWithdraw, count * 100);
        } else {
          result = await doOneInchWithdraw(objForWithdraw, count * 100);
        }
        receipt = await this.callEVMWithdrawAndGetReceipt(
          result,
          swapTransactionHash,
          isFoundary,
          objForWithdraw,
          count
        );
      }
    }
    return receipt;
  },
};
