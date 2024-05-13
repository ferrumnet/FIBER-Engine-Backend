let asyncMiddleware = require("../../../lib/response/asyncMiddleware");
import { convertIntoFeeDistributionObject } from "../../../lib/middlewares/helpers/feeDistribution/feeDistributionHelper";
import {
  gasEstimationValidation,
  destinationGasEstimation,
  sourceGasEstimation,
} from "../../../lib/middlewares/helpers/gasFeeHelpers/gasFeeHelper";
import { isSameNetworksSwap } from "../../../lib/middlewares/helpers/multiSwapHelper";

module.exports = function (router: any) {
  router.post(
    "/estimation",
    asyncMiddleware(async (req: any, res: any) => {
      let destinationGasPrices;
      const isSameNetworks = isSameNetworksSwap(
        req?.query?.sourceNetworkChainId,
        req?.query?.destinationNetworkChainId
      );
      gasEstimationValidation(req);
      req.body.feeDistribution = convertIntoFeeDistributionObject(
        req.body.feeDistribution,
        req.query.sourceAmountIn,
        req.query.sourceAmountOut,
        req.body.originalDestinationAmountIn,
        req.body.originalDestinationAmountOut
      );
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
