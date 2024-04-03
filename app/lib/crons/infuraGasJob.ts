export {};
var cron = require("node-cron");
import moment from "moment";
import { getInfuraGas } from "../httpCalls/gasEstimationAxiosHelper";
import { updateGasPriceEstimations } from "../middlewares/helpers/gasFeeHelpers/gasEstimationHelper";
import {
  getGasNetworks,
  OWLRACLE_PROVIDER_TAG,
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
    let task = cron.schedule("40 * * * * *", async () => {
      console.log(moment().utc(), ":::");
      console.log("infuraGasJob cron triggered:::");
      triggerJobs();
    });

    task.start();
  } catch (e) {
    console.log(e);
  }
}

async function triggerJobs() {
  let networks = await getGasNetworks(OWLRACLE_PROVIDER_TAG);
  if (networks && networks.length > 0) {
    for (let i = 0; i < networks.length; i++) {
      let network = networks[i];
      getGasEstimation(network);
    }
  }
}

async function getGasEstimation(network: any) {
  let data = await getInfuraGas(network?.chainId);
  data = data?.high;
  let maxFeePerGas = data?.suggestedMaxFeePerGas;
  let maxPriorityFeePerGas = data?.suggestedMaxPriorityFeePerGas;
  let gasPriceForBsc = data?.gasPrice;
  await updateGasPriceEstimations(
    network,
    maxFeePerGas,
    maxPriorityFeePerGas,
    gasPriceForBsc
  );
}
