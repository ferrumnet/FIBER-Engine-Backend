let asyncMiddleware = require("../../../lib/response/asyncMiddleware");
import {
  getQuoteAndTokenTypeInformation,
  getSwapSigned,
  getWithdrawSigned,
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

  router.get(
    "/swap/signed",
    asyncMiddleware(async (req: any, res: any) => {
      swapSignedValidation(req);
      if (
        req.query.sourceNetworkChainId == req.query.destinationNetworkChainId
      ) {
        req.query.gasPrice = "";
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
