let asyncMiddleware = require("../../../lib/response/asyncMiddleware");
import { convertIntoFeeDistributionObject } from "../../../lib/middlewares/helpers/feeDistribution/feeDistributionHelper";
import {
  getQuoteAndTokenTypeInformation,
  getSwapSigned,
  getWithdrawSigned,
  isSameNetworksSwap,
  quotAndTokenValidation,
  swapSignedValidation,
  withdrawSignedValidation,
} from "../../../lib/middlewares/helpers/multiSwapHelper";

module.exports = function (router: any) {
  router.get(
    "/token/categorized/quote/info",
    asyncMiddleware(async (req: any, res: any) => {
      quotAndTokenValidation(req);
      if (req.query.destinationWalletAddress) {
        req.query.destinationWalletAddress =
          req.query.destinationWalletAddress.toLowerCase();
      } else {
        req.query.destinationWalletAddress =
          req.query.sourceWalletAddress.toLowerCase();
      }
      return res.http200({
        data: await getQuoteAndTokenTypeInformation(req),
      });
    })
  );

  router.post(
    "/swap/signed",
    asyncMiddleware(async (req: any, res: any) => {
      swapSignedValidation(req);
      const isSameNetworkSwap = isSameNetworksSwap(
        req.query.sourceNetworkChainId,
        req.query.destinationNetworkChainId
      );
      if (isSameNetworkSwap) {
        req.query.gasPrice = "";
      } else {
        req.body.feeDistribution = convertIntoFeeDistributionObject(
          req.body.feeDistribution,
          req.query.sourceAmountIn,
          req.query.sourceAmountOut,
          req.query.destinationAmountIn,
          req.query.destinationAmountOut
        );
      }
      req.query.sourceWalletAddress =
        req.query.sourceWalletAddress.toLowerCase();

      if (req.query.destinationWalletAddress) {
        req.query.destinationWalletAddress =
          req.query.destinationWalletAddress.toLowerCase();
      } else {
        req.query.destinationWalletAddress = req.query.sourceWalletAddress;
      }
      return res.http200({
        data: await getSwapSigned(req),
      });
    })
  );

  router.post(
    "/withdraw/signed/:txHash",
    asyncMiddleware(async (req: any, res: any) => {
      withdrawSignedValidation(req);
      req.query = { ...req.query, ...req.body };
      req.query.swapTransactionHash = req.params.txHash;
      console.log("body", req.query);
      if (req.query.destinationWalletAddress) {
        req.query.destinationWalletAddress =
          req.query.destinationWalletAddress.toLowerCase();
      } else {
        req.query.destinationWalletAddress = req.query.sourceWalletAddress;
      }
      let data = await getWithdrawSigned(req);
      return res.http200(data);
    })
  );
};
