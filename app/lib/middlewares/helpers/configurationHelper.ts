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
