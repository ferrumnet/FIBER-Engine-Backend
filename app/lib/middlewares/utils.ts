declare const db: any,
  asyncMiddleware: any,
  commonFunctions: any,
  stringHelper: any,
  authHelper: any,
  signatureHelper: any,
  multiSwapHelper: any,
  fiberNode: any,
  fiberEngine: any,
  networksAxiosHelper: any,
  removeRandomKeyJob: any,
  getAllNetworkJob: any,
  web3ConfigurationHelper: any,
  web3Helper: any,
  cudosPriceAxiosHelper: any,
  transactionUpdateAxiosHelper: any;

module.exports = function () {
  const utils: any = {};
  utils.assetType = {
    FOUNDARY: "Foundry",
    REFINERY: "Refinery",
    IONIC: "Ionic",
  };
  utils.cFRMTokenAddress = "0xe685d3cc0be48bd59082ede30c3b64cbfc0326e2";
  utils.arbitrumChainID = 42161;
  return utils;
};
