var Web3 = require("web3");

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
