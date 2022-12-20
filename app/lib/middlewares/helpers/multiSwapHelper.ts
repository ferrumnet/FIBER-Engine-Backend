var Web3= require("web3");

module.exports = {

  getTokenCategorizedInformation: async function (req: any) {

    let categorizedInfo = await fiberNode.categoriseSwapAssets(
      req.query.sourceNetworkChainId,
      req.query.sourceTokenContractAddress,
      req.query.destinationNetworkChainId,
      req.query.destinationTokenContractAddress,
      req.query.sourceAmount);

    console.log(categorizedInfo);

    let data: any = {};

    if (categorizedInfo) {

      let destinationAmount = 0;
      destinationAmount = Web3.utils.fromWei(categorizedInfo?.destination?.amount || 0, 'ether');

      // if(categorizedInfo?.destination?.amount && typeof categorizedInfo?.destination?.amount === 'object'){
      // }else{
      //   destinationAmount = categorizedInfo?.destination?.amount;
      // }
      console.log('destinationAmount',destinationAmount);

      let sourceTokenCategorizedInfo: any = {};
      sourceTokenCategorizedInfo.type = categorizedInfo.source.type;
      sourceTokenCategorizedInfo.sourceAmount = req.query.sourceAmount;

      let destinationTokenCategorizedInfo: any = {};
      destinationTokenCategorizedInfo.type = categorizedInfo.destination.type;
      destinationTokenCategorizedInfo.destinationAmount = destinationAmount;

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
        req.query.destinationWalletAddress // destination wallet address
      );
    return data;
  },

  getWithdrawSigned: async function (req: any) {
    let data: any = {};
    data = await fiberEngine.withdraw(
      req.query.sourceTokenContractAddress, // goerli ada
      req.query.destinationTokenContractAddress, // bsc ada
      req.query.sourceNetworkChainId, // source chain id (goerli)
      req.query.destinationNetworkChainId, // target chain id (bsc)
      req.query.sourceAmount, //source token amount
      req.query.destinationWalletAddress // destination wallet address
    );
    return data;
  },

  validatonForSameSourceAndDestination: function (req: any) {
    if ((req.query.sourceTokenContractAddress).toLowerCase() == (req.query.destinationTokenContractAddress).toLowerCase()) {
      if (req.query.sourceNetworkChainId == req.query.destinationNetworkChainId) {
        throw 'From and to information cannot be same';
      }
    }
  },

}
