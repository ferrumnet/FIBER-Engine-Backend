export const getSlippage = async (): Promise<number> => {
  let data = await db.Configurations.findOne();
  return data?.slippage ? data?.slippage : 2;
};
