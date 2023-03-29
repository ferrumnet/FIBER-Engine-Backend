module.exports = function (router: any) {

  router.post('/withdraw/signed/:txHash', asyncMiddleware(async (req: any, res: any) => {
    if (!req.body.sourceWalletAddress || !req.body.sourceTokenContractAddress
      || !req.body.sourceNetworkChainId
      || !req.body.sourceAmount || !req.body.destinationTokenContractAddress
      || !req.body.destinationNetworkChainId || !req.body.salt 
      || !req.body.salt || !req.body.hash 
      || !req.body.signatures || !req.params.txHash) {
      return res.http401('sourceWalletAddress & sourceTokenContractAddress &'
      +' sourceNetworkChainId & sourceAmount & destinationTokenContractAddress &'
      +' destinationNetworkChainId & salt & hash & signatures &'
      +' swapTransactionHash are missing');
    }

    if(req.body.signatures && req.body.signatures.length == 0){
      return res.http401('signatures can not be empty');
    }

    req.query = { ...req.query, ...req.body }
    req.query.swapTransactionHash = req.params.txHash;
    multiSwapHelper.validatonForSameSourceAndDestination(req);

    if (req.query.destinationWalletAddress) {
      req.query.destinationWalletAddress = (req.query.destinationWalletAddress).toLowerCase();
    } else {
      req.query.destinationWalletAddress = req.query.sourceWalletAddress;
    }
    let data = await multiSwapHelper.getWithdrawSigned(req, 'v2');
    return res.http200(data);
  }));

};
