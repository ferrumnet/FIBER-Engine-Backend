var Category = require("../../../../scripts/FiberNode");
module.exports = function (router: any) {
  
  router.get('/token/categorized/info', asyncMiddleware(async (req: any, res: any) => {

    const category = new Category()

    // Params
    // sourceChainId, sourcetokenAddress, targetChainId, targetTokenAddress, inputAmount

    category.categoriseSwapAssets(5, "0x93e7a4C6FF5f5D786a33076c8F9D380E1bbA7E90", 97, "0x8834b57Fb0162977011C9D11dFF1d24b93073DA6", 12).then(console.log);


    return res.http200({
      data: await multiSwapHelper.getTokenCategorizedInformation(req)
     });

  }));

  router.get('/approval/signed', asyncMiddleware(async (req: any, res: any) => {

    return res.http200({
      data: await multiSwapHelper.getApprovalSigned(req)
    });

  }));

  router.get('/swap/signed', asyncMiddleware(async (req: any, res: any) => {

    return res.http200({
      data: await multiSwapHelper.getSwapSigned(req)
    });

  }));

  router.get('/withdraw/signed', asyncMiddleware(async (req: any, res: any) => {

    return res.http200({
      data: await multiSwapHelper.getWithdrawSigned(req)
    });

  }));

};
