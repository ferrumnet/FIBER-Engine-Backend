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
  gasEstimationAxiosHelper: any,
  transactionUpdateAxiosHelper: any;

module.exports = function () {
  const utils: any = {};
  utils.assetType = {
    FOUNDARY: "Foundry",
    REFINERY: "Refinery",
    IONIC: "Ionic",
  };
  (utils.convertFromExponentialToDecimal = function (n: any) {
    var sign = +n < 0 ? "-" : "",
      toStr = n.toString();
    if (!/e/i.test(toStr)) {
      return n;
    }
    var [lead, decimal, pow] = n
      .toString()
      .replace(/^-/, "")
      .replace(/^([0-9]+)(e.*)/, "$1.$2")
      .split(/e|\./);
    return +pow < 0
      ? sign +
          "0." +
          "0".repeat(Math.max(Math.abs(pow) - 1 || 0, 0)) +
          lead +
          decimal
      : sign +
          lead +
          (+pow >= decimal.length
            ? decimal + "0".repeat(Math.max(+pow - decimal.length || 0, 0))
            : decimal.slice(0, +pow) + "." + decimal.slice(+pow));
  }),
    (utils.cFRMTokenAddress = "0xe685d3cc0be48bd59082ede30c3b64cbfc0326e2");
  utils.arbitrumChainID = 42161;
  return utils;
};
