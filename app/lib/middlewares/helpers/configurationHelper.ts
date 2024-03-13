export const getSlippage = async (): Promise<number> => {
  let data = await db.Configurations.findOne();
  return data?.slippage ? data?.slippage : 2;
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
        console.log("type", item.type);
        return item.type;
      }
    }
  }
  return "";
};

export const isValidOneInchSelector = async (hash: string): Promise<any> => {
  console.log("i am here");
  let filter: any = {
    "oneInchSelector.hash": {
      $eq: "abc",
    },
  };
  let count = await db.Configurations.countDocuments(filter);
  console.log("count", count);
  if (count > 0) {
    return true;
  }
  return false;
};
