var axios = require("axios").default;
import { getSlippage } from "../../lib/middlewares/helpers/configurationHelper";
import { genericOneInchError } from "../../lib/middlewares/helpers/stringHelper";

interface Response {
  responseMessage: string;
  amounts: any;
  data: any;
}

export const OneInchSwap = async (
  chainId: string,
  src: string,
  dst: string,
  amount: string,
  from: string,
  receiver: string
): Promise<Response> => {
  let amounts = null;
  let data = null;
  let responseMessage = "";

  try {
    let config = {
      headers: {
        Authorization: `Bearer ${
          (global as any as any).environment.OneInchApiKey
        }`,
      },
    };
    let url = `https://api.1inch.dev/swap/v5.2/${chainId}/swap?src=${src}&dst=${dst}&amount=${amount}&from=${from}&slippage=${await getSlippage()}&disableEstimate=true&includeProtocols=true&allowPartialFill=true&receiver=${receiver}`;
    let res = await axios.get(url, config);
    if (res?.data?.toAmount) {
      amounts = res?.data?.toAmount;
    }
    if (res?.data?.tx?.data) {
      data = res?.data?.tx?.data;
    }
  } catch (error: any) {
    console.log("1Inch error", error);
    responseMessage = genericOneInchError;
  }

  let response: Response = {
    responseMessage: responseMessage,
    amounts: amounts,
    data: data,
  };
  return response;
};
