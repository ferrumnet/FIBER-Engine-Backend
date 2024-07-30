var Web3 = require("web3");
var { Big } = require("big.js");

export const getGasForWithdraw = async (
  chainId: string,
  dynamicGasLimit: string
): Promise<any> => {
  let data: any = {};
  let isAllowedDynamicGas = await isAllowedDynamicGasValues(chainId);
  let item = await db.GasFees.findOne({ chainId: chainId });
  if (item) {
    let staticGasLimit = item.gasLimit;
    console.log(item);
    if (isGasPriceSupportedNetwork(chainId)) {
      data.gasPrice = isAllowedDynamicGas
        ? item.dynamicValues.gasPrice
        : item.gasPrice;
    } else {
      let maxFeePerGas = isAllowedDynamicGas
        ? item.dynamicValues.maxFeePerGas
        : item.maxFeePerGas;
      let maxPriorityFeePerGas = isAllowedDynamicGas
        ? item.dynamicValues.maxPriorityFeePerGas
        : item.maxPriorityFeePerGas;
      data.maxFeePerGas = Web3.utils.toHex(
        Web3.utils.toWei(maxFeePerGas, "gwei")
      );
      data.maxPriorityFeePerGas = Web3.utils.toHex(
        Web3.utils.toWei(maxPriorityFeePerGas, "gwei")
      );
    }
    data.gasLimit = dynamicGasLimit
      ? dynamicGasLimit?.toString()
      : staticGasLimit;
  }
  console.log("data", data);
  return data;
};

export const isAllowedDynamicGasValues = async (
  chainId: string
): Promise<any> => {
  let data: any = {};
  let item = await db.GasFees.findOne({ chainId: chainId });
  return item?.isAllowedDynamicGasLimit ? true : false;
};

export const getGasBuffer = async (
  chainId: string,
  isFromWithdrawal = true
): Promise<any> => {
  let data = await db.GasFees.findOne({ chainId: chainId });
  if (isFromWithdrawal) {
    return data?.bufferForWithdrawal ? data?.bufferForWithdrawal : 10;
  } else {
    return data?.bufferForGasEstimation ? data?.bufferForGasEstimation : 10;
  }
};

export const addBuffer = async (
  amount: any,
  chainId: string,
  isFromWithdrawal: boolean,
  extraBuffer = 0
): Promise<any> => {
  console.log("beForBufferGasLimit", amount?.toString());
  let buffer =
    100 + extraBuffer + (await getGasBuffer(chainId, isFromWithdrawal));
  amount = amount.mul(buffer).div(100);
  amount = parseInt(amount?.toString());
  console.log(
    "afterBufferGasLimit",
    amount?.toString(),
    "buffer",
    buffer,
    "extraBuffer",
    extraBuffer
  );
  return amount;
};

export const addBuffer_ = async (
  amount: any,
  chainId: string,
  isFromWithdrawal: boolean
): Promise<any> => {
  console.log("beForBufferGasLimit", amount?.toString());
  let buffer = 100 + (await getGasBuffer(chainId, isFromWithdrawal));
  amount = Big(amount).mul(Big(buffer)).div(100);
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
  gasPrice: any
): Promise<any> => {
  let body: any = {};
  if (network) {
    if (network.chainId == 56 || network.chainId == 534352) {
      gasPrice = Number(
        addBuffer__(gasPrice, await getPriceBuffer(network.chainId))
      );
      body = {
        dynamicValues: {
          maxFeePerGas: gasPrice ? valueFixed(gasPrice, 2) : 0,
          maxPriorityFeePerGas: gasPrice ? valueFixed(gasPrice, 2) : 0,
          gasPrice: gasPrice ? valueFixed(gasPrice, 2) : 0,
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

export const isAllowedAggressivePriceForDynamicGasEstimation = async (
  chainId: any,
  isSource: boolean
): Promise<boolean> => {
  let data = await db.GasFees.findOne({ chainId: chainId });
  if (isSource) {
    return data?.isAllowedSourceAggressivePriceForDynamicGas ? true : false;
  } else {
    return data?.isAllowedDestinationAggressivePriceForDynamicGas
      ? true
      : false;
  }
};

export const isGasPriceSupportedNetwork = (chainId: any): boolean => {
  let scrollChainId = "534352";
  if (chainId == scrollChainId) {
    return true;
  }
  return false;
};

export const getCCTPGasPrice = async (chainId: any) => {
  let data = await db.GasFees.findOne({ chainId: chainId });
  return data?.gasPriceForCCTP ? data?.gasPriceForCCTP : 0;
};
