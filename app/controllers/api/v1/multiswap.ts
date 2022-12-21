module.exports = function (router: any) {
  
  router.get('/token/categorized/quote/info', asyncMiddleware(async (req: any, res: any) => {

    if (!req.query.sourceTokenContractAddress || !req.query.sourceNetworkChainId 
      || !req.query.sourceAmount || !req.query.destinationTokenContractAddress
      || !req.query.destinationNetworkChainId ) {
      return res.http401('sourceTokenContractAddress & sourceNetworkChainId & sourceAmount & destinationTokenContractAddress & destinationNetworkChainId are missing');
    }

    multiSwapHelper.validatonForSameSourceAndDestination(req);

    return res.http200({
      data: await multiSwapHelper.getTokenCategorizedInformation(req)
     });

  }));

  router.get('/swap/signed', asyncMiddleware(async (req: any, res: any) => {

    if (!req.query.sourceWalletAddress || !req.query.sourceTokenContractAddress || !req.query.sourceNetworkChainId 
      || !req.query.sourceAmount || !req.query.destinationTokenContractAddress
      || !req.query.destinationNetworkChainId ) {
      return res.http401('sourceWalletAddress & sourceTokenContractAddress & sourceNetworkChainId & sourceAmount & destinationTokenContractAddress & destinationNetworkChainId are missing');
    }

    multiSwapHelper.validatonForSameSourceAndDestination(req);


    req.query.sourceWalletAddress = (req.query.sourceWalletAddress).toLowerCase();

    if(req.query.destinationWalletAddress){
      req.query.destinationWalletAddress = (req.query.destinationWalletAddress).toLowerCase();
    }else {
      req.query.destinationWalletAddress = req.query.sourceWalletAddress;
    }

    return res.http200({
      data: await multiSwapHelper.getSwapSigned(req)
    });

  }));

  router.get('/withdraw/signed', asyncMiddleware(async (req: any, res: any) => {

    if (!req.query.sourceWalletAddress || !req.query.sourceTokenContractAddress || !req.query.sourceNetworkChainId 
      || !req.query.sourceAmount || !req.query.destinationTokenContractAddress
      || !req.query.destinationNetworkChainId) {
      return res.http401('sourceWalletAddress & sourceTokenContractAddress & sourceNetworkChainId & sourceAmount & destinationTokenContractAddress & destinationNetworkChainId are missing');
    }

    multiSwapHelper.validatonForSameSourceAndDestination(req);

    if(req.query.destinationWalletAddress){
      req.query.destinationWalletAddress = (req.query.destinationWalletAddress).toLowerCase();
    }else {
      req.query.destinationWalletAddress = req.query.sourceWalletAddress;
    }

    return res.http200({
      data: await multiSwapHelper.getWithdrawSigned(req)
    });

  }));

};
