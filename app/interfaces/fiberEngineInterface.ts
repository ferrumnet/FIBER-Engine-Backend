export interface WithdrawSigned {
  targetTokenAddress: string;
  destinationWalletAddress: string;
  destinationAmountIn: string;
  salt: string;
  signatureExpiry: number;
  signature: string;
  targetNetwork: any;
  targetSigner: any;
  targetChainId: string;
  swapTransactionHash: string;
  gasLimit: string;
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
  oneInchSelector: string;
  targetNetwork: any;
  targetSigner: any;
  targetChainId: string;
  swapTransactionHash: string;
  gasLimit: string;
  aggregateRouterContractAddress: string;
}

export interface SwapOneInch {
  amountIn: string;
  amountOut: string;
  targetChainId: string;
  targetTokenAddress: string;
  destinationWalletAddress: string;
  sourceOneInchData: string;
  sourceTokenAddress: string;
  foundryTokenAddress: string;
  withdrawalData: string;
  gasPrice: string;
  oneInchSelector: string;
  aggregateRouterContractAddress: string;
}

export interface SwapSameNetwork {
  amountIn: string;
  amountOut: string;
  sourceTokenAddress: string;
  targetTokenAddress: string;
  destinationWalletAddress: string;
  destinationOneInchData: string;
  sourceWalletAddress: string;
  oneInchSelector: string;
  aggregateRouterContractAddress: string;
}

export interface WithdrawOneInchLogs {
  "2": string;
}
