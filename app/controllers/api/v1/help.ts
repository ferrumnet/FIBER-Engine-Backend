// var Fiber = require("../../../../scripts/fiberRouter.js");
module.exports = function (router: any) {
  router.get("/create", async (req: any, res: any) => {
    return res.http200({
      token: await authHelper.createAuthToken(),
    });
  });

  router.get("/validate", async (req: any, res: any) => {
    return res.http200({
      message: "success",
    });
  });

  router.get("/multiswap", async (req: any, res: any) => {
    // const fiber = new Fiber();
    // var result = await fiber.MultiSwap(
    //   "0x636b346942ee09Ee6383C22290e89742b55797c5", // goerli ada
    //   "0xD069d62C372504d7fc5f3194E3fB989EF943d084", // bsc cake
    //   "10000000000000000000"
    // );

    // console.log("multiswap result", result)

    return res.http200({
      message: "success",
    });
  });
};
