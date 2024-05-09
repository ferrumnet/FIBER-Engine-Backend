export {};
var cron = require("node-cron");
import moment from "moment";
import { updateGasPriceEstimations } from "../middlewares/helpers/gasFeeHelpers/gasEstimationHelper";
import {
  getGasNetworks,
  SCROLL_PROVIDER_TAG,
} from "../middlewares/helpers/configurationHelper";

module.exports = function () {
  if (
    (global as any).starterEnvironment
      .isCronEnvironmentSupportedForGetGasEstimation === "yes"
  ) {
    start();
  }
};

async function start() {
  try {
    let task = cron.schedule("*/10 * * * * *", async () => {
      console.log(moment().utc(), ":::");
      console.log("scrollGasJob cron triggered:::");
      triggerJobs();
    });

    task.start();
  } catch (e) {
    console.log(e);
  }
}

async function triggerJobs() {
  let networks = await getGasNetworks(SCROLL_PROVIDER_TAG);
  if (networks && networks.length > 0) {
    for (let i = 0; i < networks.length; i++) {
      let network = networks[i];
      getGasEstimation(network);
    }
  }
}

async function getGasEstimation(network: any) {
  const item = (global as any).commonFunctions.getNetworkByChainId(
    network.chainId
  ).multiswapNetworkFIBERInformation;
  let gasPrice: any = await item.provider.getGasPrice();
  if (gasPrice) {
    await updateGasPriceEstimations(network, "", "", gasPrice);
  }
}
