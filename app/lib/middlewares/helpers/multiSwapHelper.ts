import { getSlippage } from "../../../lib/middlewares/helpers/configurationHelper";
import { sameNetworkSwapError } from "../../../lib/middlewares/helpers/stringHelper";

module.exports = {
  getTokenCategorizedInformation: async function (req: any) {
    let categorizedInfo = await fiberNode.categoriseSwapAssets(
      req.query.sourceNetworkChainId,
      req.query.sourceTokenContractAddress,
      req.query.destinationNetworkChainId,
      req.query.destinationTokenContractAddress,
      req.query.sourceAmount,
      req.query.destinationWalletAddress,
      req.query.gasEstimationDestinationAmount
    );
    let data: any = {};
    if (categorizedInfo) {
      let destinationAmount = 0;
      destinationAmount = categorizedInfo?.destination?.amount;
      let sourceOneInchData = "";
      let destinationOneInchData = "";
      let sourceBridgeAmount = "";
      if (categorizedInfo?.source?.oneInchData) {
        sourceOneInchData = categorizedInfo?.source?.oneInchData;
      }
      if (categorizedInfo?.destination?.oneInchData) {
        destinationOneInchData = categorizedInfo?.destination?.oneInchData;
      }
      if (categorizedInfo?.source?.bridgeAmount) {
        sourceBridgeAmount = categorizedInfo?.source?.bridgeAmount;
      }

      let sourceTokenCategorizedInfo: any = {};
      sourceTokenCategorizedInfo.type = categorizedInfo.source.type;
      sourceTokenCategorizedInfo.sourceAmount = req.query.sourceAmount;
      sourceTokenCategorizedInfo.sourceBridgeAmount = sourceBridgeAmount;
      sourceTokenCategorizedInfo.sourceOneInchData = sourceOneInchData;

      let destinationTokenCategorizedInfo: any = {};
      destinationTokenCategorizedInfo.type = categorizedInfo.destination.type;
      destinationTokenCategorizedInfo.destinationAmount = destinationAmount;
      destinationTokenCategorizedInfo.destinationAmountIn =
        categorizedInfo?.destination?.bridgeAmountIn;
      destinationTokenCategorizedInfo.destinationAmountOut = categorizedInfo
        ?.destination?.bridgeAmountOut
        ? categorizedInfo?.destination?.bridgeAmountOut
        : "";
      destinationTokenCategorizedInfo.destinationOneInchData =
        destinationOneInchData;
      data.slippage = await getSlippage();
      data.sourceTokenCategorizedInfo = sourceTokenCategorizedInfo;
      data.destinationTokenCategorizedInfo = destinationTokenCategorizedInfo;
    }
    return data;
  },

  getSwapSigned: async function (req: any) {
    let data: any = {};
    data = await fiberEngine.swapForAbi(
      req.query.sourceWalletAddress,
      req.query.sourceTokenContractAddress,
      req.query.destinationTokenContractAddress,
      req.query.sourceNetworkChainId,
      req.query.destinationNetworkChainId,
      req.query.sourceAmount,
      req.query.destinationWalletAddress,
      req.query
    );
    return data;
  },

  getWithdrawSigned: async function (req: any) {
    if ((await this.isAlreadyInTransactionLog(req)) == false) {
      let log = await this.saveTransactionLog(req);
      let query = req.query;
      this.doWithdraw(req, query);
    } else {
      throw "Transaction already in processing";
    }
    return null;
  },

  validatonForSameSourceAndDestination: function (req: any) {
    if (
      req.query.sourceTokenContractAddress.toLowerCase() ==
      req.query.destinationTokenContractAddress.toLowerCase()
    ) {
      if (
        req.query.sourceNetworkChainId == req.query.destinationNetworkChainId
      ) {
        throw sameNetworkSwapError;
      }
    }
  },

  saveTransactionLog: async function (req: any) {
    try {
      let body = req.query;
      body.responseCode = 100;
      body.createdAt = new Date();
      body.updatedAt = new Date();
      return await db.TransactionLogs.create(body);
    } catch (e) {}
  },

  isAlreadyInTransactionLog: async function (req: any): Promise<boolean> {
    try {
      let countFilter = {
        swapTransactionHash: req.query.swapTransactionHash,
        $or: [{ responseCode: 100 }, { responseCode: 200 }],
      };
      let count = await db.TransactionLogs.countDocuments(countFilter);
      if (count == 1) {
        return true;
      }
    } catch (e) {
      console.log(e);
    }
    return false;
  },

  updateTransactionLog: async function (data: any, swapTransactionHash: any) {
    try {
      await db.TransactionLogs.updateMany(
        { swapTransactionHash: swapTransactionHash },
        {
          withdrawTransactionHash: data.txHash,
          responseCode: data.responseCode,
          responseMessage: data.responseMessage,
          updatedAt: new Date(),
        },
        { new: true }
      );
    } catch (e) {
      console.log(e);
    }
  },

  doWithdraw: async function (req: any, query: any) {
    let data = await fiberEngine.withdraw(
      query.sourceTokenContractAddress,
      query.destinationTokenContractAddress,
      query.sourceNetworkChainId,
      query.destinationNetworkChainId,
      query.sourceAmount,
      query.destinationWalletAddress,
      req.query.swapTransactionHash,
      req.body
    );
    await this.updateTransactionLog(data, req.query.swapTransactionHash);
    data = {
      data: data.txHash,
      withdraw: data,
      responseCode: data.responseCode,
      responseMessage: data.responseMessage,
    };
    await await transactionUpdateAxiosHelper.updateTransactionJobStatus(
      req.query.swapTransactionHash,
      data
    );
    return data;
  },
};
