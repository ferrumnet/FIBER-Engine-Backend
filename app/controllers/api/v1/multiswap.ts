let asyncMiddleware = require("../../../lib/response/asyncMiddleware");
import {
  getQuoteAndTokenTypeInformation,
  getSwapSigned,
  getWithdrawSigned,
} from "../../../lib/middlewares/helpers/multiSwapHelper";

module.exports = function (router: any) {
  router.get(
    "/token/categorized/quote/info",
    asyncMiddleware(async (req: any, res: any) => {
      if (
        !req.query.sourceWalletAddress ||
        !req.query.sourceTokenContractAddress ||
        !req.query.sourceNetworkChainId ||
        !req.query.sourceAmount ||
        !req.query.destinationTokenContractAddress ||
        !req.query.destinationNetworkChainId
      ) {
        return res.http401(
          "sourceWalletAddress & sourceTokenContractAddress & sourceNetworkChainId & sourceAmount & destinationTokenContractAddress & destinationNetworkChainId are missing"
        );
      }

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
      if (
        !req.query.sourceWalletAddress ||
        !req.query.sourceTokenContractAddress ||
        !req.query.sourceNetworkChainId ||
        !req.query.sourceAmount ||
        !req.query.destinationTokenContractAddress ||
        !req.query.destinationNetworkChainId ||
        !req.query.sourceAssetType ||
        !req.query.destinationAssetType
      ) {
        return res.http401(
          "sourceWalletAddress & sourceTokenContractAddress & sourceNetworkChainId & sourceAmount & destinationTokenContractAddress & destinationNetworkChainId & sourceAssetType & destinationAssetType are missing"
        );
      }
      if (
        req.query.sourceNetworkChainId != req.query.destinationNetworkChainId &&
        !req.query.gasPrice
      ) {
        return res.http401("gasPrice is missing");
      }
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
      if (
        !req.body.sourceWalletAddress ||
        !req.body.sourceTokenContractAddress ||
        !req.body.sourceNetworkChainId ||
        !req.body.sourceAmount ||
        !req.body.destinationTokenContractAddress ||
        !req.body.destinationNetworkChainId ||
        !req.body.salt ||
        !req.body.hash ||
        !req.body.signatures ||
        !req.params.txHash
      ) {
        return res.http401(
          "sourceWalletAddress & sourceTokenContractAddress &" +
            " sourceNetworkChainId & sourceAmount & destinationTokenContractAddress &" +
            " destinationNetworkChainId & salt & hash & signatures &" +
            " swapTransactionHash are missing"
        );
      }

      if (req.body.signatures && req.body.signatures.length == 0) {
        return res.http401("signatures can not be empty");
      }

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
