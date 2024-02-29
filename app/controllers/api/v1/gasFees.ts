import {
  gasEstimationValidation,
  destinationGasEstimation,
  sourceGasEstimation,
} from "../../../lib/middlewares/helpers/gasFeeHelpers/dynamicGasFeeEstimationHelper";

module.exports = function (router: any) {
  router.get(
    "/estimation",
    asyncMiddleware(async (req: any, res: any) => {
      gasEstimationValidation(req);
      let destinationGasPrices = await destinationGasEstimation(req);
      let sourceGasPrices = await sourceGasEstimation(
        req,
        destinationGasPrices?.gasPriceInMachine
      );

      return res.http200({
        source: sourceGasPrices,
        destination: destinationGasPrices,
      });
    })
  );

  router.get("/:chainId", async (req: any, res: any) => {
    var filter: any = {};

    if (req.params.chainId) {
      filter.chainId = req.params.chainId;
    }

    let gasFees = await db.GasFees.findOne(filter);

    return res.http200({
      gasFees: gasFees,
    });
  });
};
