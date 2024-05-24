export const OWLRACLE_PROVIDER_TAG = "owlracle";
export const INFURA_PROVIDER_TAG = "infura";
export const SCROLL_PROVIDER_TAG = "scroll";
export const DEFAULT_SLIPPAGE = "2";
const CCTP_ATTESTATION_API_THRESHOLD = 360;
const PROVIDER_API_THRESHOLD = 180;
export const CCTP_BALANCE_THRESHOLD = 4;

export const getSlippage = async (slippage = ""): Promise<any> => {
  if (slippage) {
    return slippage;
  }
  let data = await db.Configurations.findOne();
  return data?.slippage ? data?.slippage?.toString() : DEFAULT_SLIPPAGE;
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

export const isCCTPNetwork = async (chainId: string): Promise<boolean> => {
  let filter: any = {
    "allowedNetworksForCCTP.chainId": {
      $eq: chainId,
    },
  };
  let count = await db.Configurations.countDocuments(filter);
  if (count > 0) {
    return true;
  }
  return false;
};

export const getCCTPAttestationApiThreshold = async (): Promise<number> => {
  let data = await db.Configurations.findOne();
  return data?.cctpAttestationApiThreshold
    ? data?.cctpAttestationApiThreshold
    : CCTP_ATTESTATION_API_THRESHOLD;
};

export const getProviderApiThreshold = async (): Promise<number> => {
  let data = await db.Configurations.findOne();
  return data?.providerApiThreshold
    ? data?.providerApiThreshold
    : PROVIDER_API_THRESHOLD;
};

export const getCCTPBalanceThreshold = async (): Promise<number> => {
  let data = await db.Configurations.findOne();
  return data?.cctpBalanceThreshold
    ? data?.cctpBalanceThreshold
    : CCTP_BALANCE_THRESHOLD;
};

export const isKyberSwap = async (chainId: string): Promise<boolean> => {
  let filter: any = {
    "allowedNetworksForKyberSwap.chainId": {
      $eq: chainId,
    },
  };
  let count = await db.Configurations.countDocuments(filter);
  if (count > 0) {
    return true;
  }
  return false;
};

export const getChainKyberSwap = async (chainId: string): Promise<string> => {
  let filter: any = {
    "allowedNetworksForKyberSwap.chainId": {
      $eq: chainId,
    },
  };
  let data = await db.Configurations.findOne(filter);
  if (data?.allowedNetworksForKyberSwap?.length > 0) {
    for (let item of data?.allowedNetworksForKyberSwap) {
      if (item.chainId == chainId) {
        return item.name;
      }
    }
  }
  return "";
};

export const getPlatformFee = async (): Promise<number> => {
  let data = await db.Configurations.findOne();
  return data?.platformFee;
};

export const getOneInchExcludedProtocols = async (): Promise<any> => {
  let data = await db.Configurations.findOne();
  let protocols: any = data?.oneInchExcludedProtocols
    ? data?.oneInchExcludedProtocols
    : [];
  if (protocols) {
    protocols = protocols.join(",");
  } else {
    protocols = "";
  }
  return protocols ? protocols : "";
};
