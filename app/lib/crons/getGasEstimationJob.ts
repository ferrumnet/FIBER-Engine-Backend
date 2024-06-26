export {};
var cron = require("node-cron");
import moment from "moment";

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
    let task = cron.schedule("50 * * * * *", async () => {
      console.log(moment().utc(), ":::");
      console.log("getGastEstimation cron triggered:::");
      triggerJobs();
    });

    task.start();
  } catch (e) {
    console.log(e);
  }
}

async function triggerJobs() {
  let networks = (global as any).networks;
  if (networks && networks.length > 0) {
    for (let i = 0; i < networks.length; i++) {
      let network = networks[i];
      if (
        network &&
        network.isAllowedDynamicGasValues == true &&
        network.isNonEVM == false
      ) {
        getGasEstimation(network);
      }
    }
  }
}

async function getGasEstimation(network: any) {
  let apiKey = getApiKey(network.chainId);
  let gasEstimation = await (
    global as any
  ).gasEstimationAxiosHelper.getGasEstimationByNetworkName(
    network?.networkShortName?.toLowerCase(),
    apiKey
  );
  await updateGas(network, gasEstimation);
}

async function updateGas(network: any, gasEstimation: any) {
  let speed: any = getSpeed(gasEstimation);
  let body: any = {};
  if (network && speed) {
    if (network.chainId == 56) {
      body = {
        dynamicValues: {
          maxFeePerGas: speed?.gasPrice ? valueFixed(speed?.gasPrice, 2) : 0,
          maxPriorityFeePerGas: speed?.gasPrice
            ? valueFixed(speed?.gasPrice, 2)
            : 0,
        },
      };
    } else {
      body = {
        dynamicValues: {
          maxFeePerGas: speed?.maxFeePerGas
            ? valueFixed(speed?.maxFeePerGas, 2)
            : 0,
          maxPriorityFeePerGas: speed?.maxPriorityFeePerGas
            ? valueFixed(speed?.maxPriorityFeePerGas, 2)
            : 0,
        },
      };
    }

    await db.GasFees.findOneAndUpdate({ chainId: network.chainId }, body, {
      new: true,
    });
  }
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

function valueFixed(x: any, d: any) {
  if (!d) return x.toFixed(d); // don't go wrong if no decimal
  return x.toFixed(d).replace(/\.?0+$/, "");
}
