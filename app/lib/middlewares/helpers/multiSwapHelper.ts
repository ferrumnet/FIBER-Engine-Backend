module.exports = { 

  getTokenCategorizedInformation: async function (req: any) {

    let categorizedInfo = await fiberNode.categoriseSwapAssets(req.query.sourceNetworkChainId, req.query.sourceTokenContractAddress, req.query.destinationNetworkChainId, req.query.destinationTokenContractAddress, req.query.sourceAmount);
    console.log(categorizedInfo);
    let data: any = {};

    if(categorizedInfo){
      let sourceTokenCategorizedInfo: any = {};
      sourceTokenCategorizedInfo.type = categorizedInfo.sourceAssetType;
      sourceTokenCategorizedInfo.sourceAmount = req.query.sourceAmount;
  
      let destinationTokenCategorizedInfo: any = {};
      destinationTokenCategorizedInfo.type = categorizedInfo.targetAssetType;
      destinationTokenCategorizedInfo.sourceAmount = 20;
  
      data.sourceTokenCategorizedInfo = sourceTokenCategorizedInfo;
      data.destinationTokenCategorizedInfo = destinationTokenCategorizedInfo;
  
    }

    return data;
  },

  getSwapSigned: async function (req: any) {
    let data: any = {};
    return data;
  },

  getWithdrawSigned: async function (req: any) {
    let data: any = {};
    // throw 'data error';
    return data;
  },

}
