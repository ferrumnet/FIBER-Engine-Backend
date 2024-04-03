export const OWLRACLE_PROVIDER_TAG = "owlracle";
export const INFURA_PROVIDER_TAG = "infura";

export const getSlippage = async (slippage = ""): Promise<any> => {
  if (slippage) {
    return slippage;
  }
  let data = await db.Configurations.findOne();
  return data?.slippage ? data?.slippage?.toString() : "2";
};

export const getNativeTokens = async (): Promise<any> => {
  let data = await db.Configurations.findOne();
  return data?.nativeTokens ? data?.nativeTokens : [];
};

export const getOneInchSelector = async (hash: string): Promise<any> => {
  let filter: any = {
    "oneInchSelector.hash": {
      $eq: hash,
    },
  };
  let data = await db.Configurations.findOne(filter);
  if (data?.oneInchSelector?.length > 0) {
    for (let item of data?.oneInchSelector) {
      if (item.hash == hash) {
        return item.type;
      }
    }
  }
  return "";
};

export const isValidOneInchSelector = async (
  hash: string
): Promise<boolean> => {
  let filter: any = {
    "oneInchSelector.hash": {
      $eq: hash,
    },
  };
  let count = await db.Configurations.countDocuments(filter);
  if (count > 0) {
    return true;
  }
  return false;
};

export const getGasNetworks = async (provider: string) => {
  let networks: any = [];
  let filter: any = {
    "gasNetworks.provider": {
      $eq: provider,
    },
  };
  let data = await db.Configurations.findOne(filter);
  if (data?.gasNetworks?.length > 0) {
    for (let item of data?.gasNetworks) {
      if (item.provider == provider) {
        networks.push(item);
      }
    }
  }
  return networks;
};
