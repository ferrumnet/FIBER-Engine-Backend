
declare const db: any,
  asyncMiddleware: any,
  commonFunctions: any,
  stringHelper: any,
  authHelper: any,
  signatureHelper: any,
  multiSwapHelper: any,
  fiberNode: any,
  fiberEngine: any,
  networksHelper: any,
  removeRandomKeyJob: any,
  getAllNetworkJob: any,
  receiptsHelper: any,
  web3ConfigurationHelper: any,
  web3Helper: any,
  withdrawHelper: any,
  cudosPriceHelper: any


module.exports = function () {
  const utils: any = {};
  utils.assetType = {
    FOUNDARY: 'Foundry',
    REFINERY: 'Refinery',
    IONIC: 'Ionic',
  }
  return utils;
}