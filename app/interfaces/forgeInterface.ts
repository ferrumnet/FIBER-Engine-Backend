export interface Contract {
  rpcUrl: string;
  contractAddress: string;
}

export interface WithdrawSigned {
  targetTokenAddress: string;
  destinationWalletAddress: string;
  destinationAmountIn: string;
  salt: string;
  signatureExpiry: number;
  signature: string;
}

export interface WithdrawSignedAndSwapOneInch {
  destinationWalletAddress: string;
  destinationAmountIn: string;
  destinationAmountOut: string;
  targetFoundryTokenAddress: string;
  targetTokenAddress: string;
  destinationOneInchData: string;
  salt: string;
  signatureExpiry: number;
  signature: string;
}

export interface DestinationGasEstimationResponse {
  gasPriceInNumber: string;
  gasPriceInMachine: string;
}
