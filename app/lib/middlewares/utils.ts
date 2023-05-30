
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
  transactionUpdateAxiosHelper: any

module.exports = function () {
  const utils: any = {};
  utils.assetType = {
    FOUNDARY: 'Foundry',
    REFINERY: 'Refinery',
    IONIC: 'Ionic',
  }
  return utils;
}