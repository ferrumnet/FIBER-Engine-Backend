var Web3 = require("web3");

module.exports = {
  getTokenCategorizedInformation: async function (req: any) {
    let categorizedInfo = await fiberNode.categoriseSwapAssets(
      req.query.sourceNetworkChainId,
      req.query.sourceTokenContractAddress,
      req.query.destinationNetworkChainId,
      req.query.destinationTokenContractAddress,
      req.query.sourceAmount
    );

    console.log(categorizedInfo);

    let data: any = {};

    if (categorizedInfo) {
      let destinationAmount = 0;
      destinationAmount = categorizedInfo?.destination?.amount;
      console.log("destinationAmount", destinationAmount);

      let sourceTokenCategorizedInfo: any = {};
      sourceTokenCategorizedInfo.type = categorizedInfo.source.type;
      sourceTokenCategorizedInfo.sourceAmount = req.query.sourceAmount;

      let destinationTokenCategorizedInfo: any = {};
      destinationTokenCategorizedInfo.type = categorizedInfo.destination.type;
      destinationTokenCategorizedInfo.destinationAmount = destinationAmount;
      destinationTokenCategorizedInfo.bridgeAmount =
        categorizedInfo?.destination?.bridgeAmount;

      data.sourceTokenCategorizedInfo = sourceTokenCategorizedInfo;
      data.destinationTokenCategorizedInfo = destinationTokenCategorizedInfo;
    }
    return data;
  },

  getSwapSigned: async function (req: any) {
    let data: any = {};
    data = await fiberEngine.swapForAbi(
      req.query.sourceWalletAddress,
      req.query.sourceTokenContractAddress, // goerli ada
      req.query.destinationTokenContractAddress, // bsc ada
      req.query.sourceNetworkChainId, // source chain id (goerli)
      req.query.destinationNetworkChainId, // target chain id (bsc)
      req.query.sourceAmount, //source token amount
      req.query.destinationWalletAddress, // destination wallet address
      req.query
    );
    return data;
  },

  getWithdrawSigned: async function (req: any) {
    let log = await this.saveTransactionLog(req);
    let query = req.query;
    this.doWithdraw(req, query);
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
        throw "From and to information cannot be same";
      }
    }
  },

  saveTransactionLog: async function (req: any) {
    try {
      let body = req.query;
      body.createdAt = new Date();
      body.updatedAt = new Date();
      return await db.TransactionLogs.create(body);
    } catch (e) {
      console.log("createTransactionLog", e);
    }
  },

  updateTransactionLog: async function (data: any, swapTransactionHash: any) {
    try {
      await db.TransactionLogs.findOneAndUpdate(
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
      console.log("updateTransactionLog", e);
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
