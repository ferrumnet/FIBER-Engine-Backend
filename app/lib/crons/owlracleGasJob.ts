export {};
var cron = require("node-cron");
import moment from "moment";
import { getOwlracleGas } from "../httpCalls/gasEstimationAxiosHelper";
import { updateGasPriceEstimations } from "../middlewares/helpers/gasFeeHelpers/gasEstimationHelper";
import {
  getGasNetworks,
  OWLRACLE_PROVIDER_TAG,
} from "../middlewares/helpers/configurationHelper";

module.exports = function () {
  if (
    (global as any).starterEnvironment
      .isCronEnvironmentSupportedForGetGasEstimation === "no"
  ) {
    start();
  }
};

async function start() {
  try {
    let task = cron.schedule("50 * * * * *", async () => {
      console.log(moment().utc(), ":::");
      console.log("owlracleGasJob cron triggered:::");
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
  let apiKey = getApiKey(network.chainId);
  let data: any = await getOwlracleGas(
    network?.shortName?.toLowerCase(),
    apiKey
  );
  data = getSpeed(data);
  let maxFeePerGas = data?.maxFeePerGas;
  let maxPriorityFeePerGas = data?.maxPriorityFeePerGas;
  let gasPriceForBsc = data?.gasPrice;
  await updateGasPriceEstimations(
    network,
    maxFeePerGas,
    maxPriorityFeePerGas,
    gasPriceForBsc
  );
}

function getSpeed(gasEstimation: any) {
  if (
    gasEstimation &&
    gasEstimation.speeds &&
    gasEstimation.speeds.length > 0
  ) {
    let speed = getHighAcceptanceValue(gasEstimation.speeds);
    return speed ? speed : null;
  }
  return null;
}

function getHighAcceptanceValue(speeds: any) {
  let value = null;
  const max = Math.max(...speeds.map((item: any) => item.acceptance), 0);
  for (let i = 0; i < speeds.length; i++) {
    let item = speeds[i];
    if ((item.acceptance = max)) {
      value = item;
    }
  }
  return value;
}

function getApiKey(chainId: String) {
  let apiKey = null;
  if (chainId) {
    let apiKeys = (global as any).environment.gasOwlracleApiKeys;
    if (apiKeys) {
      let apiKeysJson = JSON.parse(apiKeys);
      if (apiKeysJson && apiKeysJson.length > 0) {
        for (let i = 0; i < apiKeysJson.length; i++) {
          let item = apiKeysJson[i];
          if ((item.chainId = chainId)) {
            return item.apiKey;
          }
        }
      }
    }
  }
  return apiKey;
}
