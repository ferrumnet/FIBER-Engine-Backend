interface Response {
  responseMessage: string;
  amounts: any;
}

export const getAmountOut = async (
  network: any,
  path: any,
  amount: any
): Promise<Response> => {
  let amounts = null;
  let responseMessage = "";
  try {
    amounts = await network.dexContract.getAmountsOut(String(amount), path);
  } catch (error: any) {
    console.log("DEX error", error?.reason);
    responseMessage = error?.reason;
    // responseMessage = "ALERT: DEX doesn't have liquidity for this pair";
  }

  let response: Response = {
    responseMessage: responseMessage,
    amounts: amounts,
  };
  return response;
};
