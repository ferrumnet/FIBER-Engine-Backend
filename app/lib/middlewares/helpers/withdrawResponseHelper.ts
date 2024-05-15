import { genericProviderError } from "./stringHelper";

const SUCCESS = "success";
export const IN_SUFFICIENT_LIQUIDITY_ERROR = "Insufficient liquidity";

export const CODE_100 = 100;
export const CODE_200 = 200;
export const CODE_201 = 201;
export const CODE_701 = 701;
export const CODE_702 = 702;

interface Response {
  responseCode: number;
  responseMessage: string;
  transactionHash: string;
}

export const createCudosResponse = (tx: any): Response => {
  let responseCode = tx?.code ? tx.code : CODE_201;
  let transactionHash = tx?.transactionHash ? tx.transactionHash : "";
  let responseMessage = "";

  if (tx && tx.code == 0) {
    responseCode = CODE_200;
    responseMessage = SUCCESS;
  }

  let response: Response = {
    responseCode: responseCode,
    responseMessage: responseMessage,
    transactionHash: transactionHash,
  };
  return response;
};

export const createEVMResponse = (tx: any): Response => {
  let responseCode = CODE_201;
  let transactionHash = tx?.transactionHash ? tx.transactionHash : "";
  let responseMessage = tx?.responseMessage ? tx.responseMessage : "";

  if (tx != null && tx.status != null && tx.status == true) {
    responseCode = CODE_200;
    responseMessage = SUCCESS;
  } else if (tx?.code == CODE_701) {
    responseCode = CODE_701;
    responseMessage = IN_SUFFICIENT_LIQUIDITY_ERROR;
  } else if (tx?.code == CODE_702) {
    responseCode = CODE_702;
    responseMessage = genericProviderError;
  }

  let response: Response = {
    responseCode: responseCode,
    responseMessage: responseMessage,
    transactionHash: transactionHash,
  };
  return response;
};

const filterEVMResponseMessage = (tx: any): Response => {
  let response: Response = {
    responseCode: 0,
    responseMessage: "",
    transactionHash: "",
  };
  return response;
};
