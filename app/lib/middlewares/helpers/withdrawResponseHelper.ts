const SUCCESS = "success";
const CODE_200 = 200;
const CODE_201 = 201;

interface Response {
  responseCode: number;
  responseMessage: string;
  transactionHash: string;
}

export const createCudosResponse = (tx: any): Response => {
  console.log("createCudosResponse", tx);
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
  console.log("createEVMResponse", tx);
  let responseCode = CODE_201;
  let transactionHash = tx?.hash ? tx.hash : "";
  let responseMessage = "";

  if (tx != null && tx.status != null && tx.status == true) {
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

const filterEVMResponseMessage = (tx: any): Response => {
  console.log("createEVMResponse", tx);
  let response: Response = {
    responseCode: 0,
    responseMessage: "",
    transactionHash: "",
  };
  return response;
};
