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

      multiSwapHelper.validatonForSameSourceAndDestination(req);

      return res.http200({
        data: await multiSwapHelper.getTokenCategorizedInformation(req),
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
        !req.query.destinationAssetType ||
        !req.query.gasPrice
      ) {
        return res.http401(
          "sourceWalletAddress & sourceTokenContractAddress & sourceNetworkChainId & sourceAmount & destinationTokenContractAddress & destinationNetworkChainId & sourceAssetType & destinationAssetType & gasPrice are missing"
        );
      }

      multiSwapHelper.validatonForSameSourceAndDestination(req);

      req.query.sourceWalletAddress =
        req.query.sourceWalletAddress.toLowerCase();

      if (req.query.destinationWalletAddress) {
        req.query.destinationWalletAddress =
          req.query.destinationWalletAddress.toLowerCase();
      } else {
        req.query.destinationWalletAddress = req.query.sourceWalletAddress;
      }

      return res.http200({
        data: await multiSwapHelper.getSwapSigned(req),
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
        // ||
        // !req.body.gasLimit
      ) {
        return res.http401(
          "sourceWalletAddress & sourceTokenContractAddress &" +
            " sourceNetworkChainId & sourceAmount & destinationTokenContractAddress &" +
            " destinationNetworkChainId & salt & hash & signatures &" +
            " swapTransactionHash & gasLimit are missing"
        );
      }

      if (req.body.signatures && req.body.signatures.length == 0) {
        return res.http401("signatures can not be empty");
      }

      req.query = { ...req.query, ...req.body };
      req.query.swapTransactionHash = req.params.txHash;
      multiSwapHelper.validatonForSameSourceAndDestination(req);
      console.log("body", req.query);
      if (req.query.destinationWalletAddress) {
        req.query.destinationWalletAddress =
          req.query.destinationWalletAddress.toLowerCase();
      } else {
        req.query.destinationWalletAddress = req.query.sourceWalletAddress;
      }
      let data = await multiSwapHelper.getWithdrawSigned(req);
      return res.http200(data);
    })
  );
};
