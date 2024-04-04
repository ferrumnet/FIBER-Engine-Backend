var Web3 = require("web3");
var { Big } = require("big.js");

export const getGasForWithdraw = async (
  chainId: string,
  dynamicGasLimit: string
): Promise<any> => {
  let data: any = {};
  let network = (global as any).commonFunctions.getNetworkByChainId(chainId);
  let item = await db.GasFees.findOne({ chainId: chainId });
  if (item && network) {
    let isAllowedDynamicGasValues = network?.isAllowedDynamicGasValues;
    let maxFeePerGas = isAllowedDynamicGasValues
      ? item.dynamicValues.maxFeePerGas
      : item.maxFeePerGas;
    let maxPriorityFeePerGas = isAllowedDynamicGasValues
      ? item.dynamicValues.maxPriorityFeePerGas
      : item.maxPriorityFeePerGas;
    let staticGasLimit = item.gasLimit;
    data.maxFeePerGas = Web3.utils.toHex(
      Web3.utils.toWei(maxFeePerGas, "gwei")
    );
    data.maxPriorityFeePerGas = Web3.utils.toHex(
      Web3.utils.toWei(maxPriorityFeePerGas, "gwei")
    );

    data.gasLimit = dynamicGasLimit
      ? dynamicGasLimit?.toString()
      : staticGasLimit;
  }
  return data;
};

export const getGasForSwap = async (chainId: any, from: any): Promise<any> => {
  let data: any = {};
  let network = (global as any).commonFunctions.getNetworkByChainId(chainId);
  let item = await db.GasFees.findOne({ chainId: chainId });
  if (item && network) {
    let isAllowedDynamicGasValues = network?.isAllowedDynamicGasValues;
    let maxFeePerGas = isAllowedDynamicGasValues
      ? item.dynamicValues.maxFeePerGas
      : item.maxFeePerGas;
    let maxPriorityFeePerGas = isAllowedDynamicGasValues
      ? item.dynamicValues.maxPriorityFeePerGas
      : item.maxPriorityFeePerGas;
    let gasLimit = item.gasLimit;

    data.maxFeePerGas = Web3.utils.toHex(
      Web3.utils.toWei(maxFeePerGas, "gwei")
    );
    data.maxPriorityFeePerGas = Web3.utils.toHex(
      Web3.utils.toWei(maxPriorityFeePerGas, "gwei")
    );
    // data.gas = { gasLimit: gasLimit };
  } else {
    data.gas = {};
  }
  return data;
};

export const isAllowedDynamicGasValues = async (
  chainId: string
): Promise<any> => {
  let data: any = {};
  let item = await db.GasFees.findOne({ chainId: chainId });
  return item?.isAllowedDynamicGasLimit ? true : false;
};

export const getGasBuffer = async (chainId: string): Promise<any> => {
  let data = await db.GasFees.findOne({ chainId: chainId });
  return data?.gasBuffer ? data?.gasBuffer : 10;
};

export const addBuffer = async (amount: any, chainId: string): Promise<any> => {
  console.log("beForBufferGasLimit", amount?.toString());
  let buffer = 100 + (await getGasBuffer(chainId));
  amount = amount.mul(buffer).div(100);
  amount = parseInt(amount?.toString());
  console.log("afterBufferGasLimit", amount?.toString(), "buffer", buffer);
  return amount;
};

export const addBuffer_ = async (
  amount: any,
  chainId: string
): Promise<any> => {
  console.log("beForBufferGasLimit", amount?.toString());
  let buffer = 100 + (await getGasBuffer(chainId));
  amount = amount.mul(buffer).div(100);
  console.log("afterBufferGasLimit", amount?.toString(), "buffer", buffer);
  return amount;
};

const addBuffer__ = (amount: any, buffer: any) => {
  buffer = 100 + buffer;
  amount = Big(amount);
  amount = amount.mul(buffer).div(100);
  console.log("afterBuffer", amount?.toString(), "buffer", buffer);
  return amount?.toString();
};

export const updateGasPriceEstimations = async (
  network: any,
  maxFeePerGas: any,
  maxPriorityFeePerGas: any,
  gasPriceForBsc: any
): Promise<any> => {
  let body: any = {};
  if (network) {
    if (network.chainId == 56) {
      gasPriceForBsc = Number(
        addBuffer__(gasPriceForBsc, await getPriceBuffer(network.chainId))
      );
      body = {
        dynamicValues: {
          maxFeePerGas: gasPriceForBsc ? valueFixed(gasPriceForBsc, 2) : 0,
          maxPriorityFeePerGas: gasPriceForBsc
            ? valueFixed(gasPriceForBsc, 2)
            : 0,
        },
      };
    } else {
      console.log(maxFeePerGas, maxPriorityFeePerGas);
      body = {
        dynamicValues: {
          maxFeePerGas: maxFeePerGas ? valueFixed(maxFeePerGas, 2) : 0,
          maxPriorityFeePerGas: maxPriorityFeePerGas
            ? valueFixed(maxPriorityFeePerGas, 2)
            : 0,
        },
      };
    }
    console.log(network.chainId, body);

    await db.GasFees.findOneAndUpdate({ chainId: network.chainId }, body, {
      new: true,
    });
  }
};

export const getGasPrice = async (chainId: string): Promise<any> => {
  let network = (global as any).commonFunctions.getNetworkByChainId(chainId);
  let isAllowedDynamicGasValues = network?.isAllowedDynamicGasValues;
  let data = await db.GasFees.findOne({ chainId: chainId });
  let maxFeePerGas = isAllowedDynamicGasValues
    ? data.dynamicValues.maxFeePerGas
    : data.maxFeePerGas;
  return maxFeePerGas;
};

const valueFixed = (x: any, d: any) => {
  if (!d) return x.toFixed(d); // don't go wrong if no decimal
  x = Math.ceil(x * 100) / 100;
  return x.toFixed(d).replace(/\.?0+$/, "");
};

const getPriceBuffer = async (chainId: any) => {
  let data = await db.GasFees.findOne({ chainId: chainId });
  return data?.aggressivePriceBuffer ? data?.aggressivePriceBuffer : 0.1;
};
