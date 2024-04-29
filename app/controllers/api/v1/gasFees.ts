let asyncMiddleware = require("../../../lib/response/asyncMiddleware");
import {
  gasEstimationValidation,
  destinationGasEstimation,
  sourceGasEstimation,
} from "../../../lib/middlewares/helpers/gasFeeHelpers/dynamicGasFeeEstimationHelper";
import { isSameNetworksSwap } from "../../../lib/middlewares/helpers/multiSwapHelper";

module.exports = function (router: any) {
  router.get(
    "/estimation",
    asyncMiddleware(async (req: any, res: any) => {
      let destinationGasPrices;
      const isSameNetworks = isSameNetworksSwap(
        req?.body?.sourceNetworkChainId,
        req?.body?.destinationNetworkChainId
      );
      gasEstimationValidation(req);
      if (!isSameNetworks) {
        destinationGasPrices = await destinationGasEstimation(req);
      }
      let sourceGasPrices = await sourceGasEstimation(
        req,
        destinationGasPrices?.gasPriceInMachine,
        isSameNetworks
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
